import { useEffect } from "react";
import axios from "axios";
import {
  Viewer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian3,
  Cartesian2,
  NearFarScalar,
  VerticalOrigin,
  Ion,
  Cartographic,
  Math as CesiumMath,
} from "cesium";

const API = process.env.NEXT_PUBLIC_API_URL;

export interface Point {
  _id: string;
  lat: number;
  long: number;
  descriptor?: string;
  tags: string[];
  photos: { url: string; caption?: string }[];
}

export interface PointMarkerOptions {
  viewer?: Viewer;
  onSelect?(pt: Point): void;
  onCreate?(coords: { lat: number; long: number }): void;
}

export default function usePointMarkers({
  viewer,
  onSelect,
  onCreate,
}: PointMarkerOptions) {
  useEffect(() => {
    console.log('[usePointMarkers] effect, viewer=', viewer);

    if (!viewer) {
      console.log("[usePointMarkers] no viewer yet – waiting");
      return;
    }

    let handler: ScreenSpaceEventHandler;
    Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN!;

    (async () => {
      // Draw all existing points
      const { data } = await axios.get<Point[]>(`${API}/points`);
      console.log("[usePointMarkers] got points:", data);
      data.forEach((pt: Point) => addPoint(viewer, pt));

      // Handle left click
      handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((event: { position: Cartesian2 }) => {
        console.log("[usePointMarkers] globe clicked at pixel", event.position);
        const pick = viewer.scene.pick(event.position);
        console.log("[usePointMarkers] pick result", pick && pick.id);

        if (pick?.id && onSelect) {
          const point = data.find((p: Point) => p._id === pick.id.id);
          if (point) onSelect(point);
        } else if (onCreate) {
          const cart = viewer.camera.pickEllipsoid(
            event.position,
            viewer.scene.globe.ellipsoid
          );
          if (cart) {
            const c = Cartographic.fromCartesian(cart);
            onCreate({
              lat: CesiumMath.toDegrees(c.latitude),
              long: CesiumMath.toDegrees(c.longitude),
            });
          }
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    })();

    return () => {
      handler?.destroy();
      viewer.entities.removeAll();
    };
  }, [viewer, onSelect, onCreate]);
}

// Adding the point to the canvas
export function addPoint(viewer: Viewer, pt: Point) {
  viewer.entities.add({
    id: pt._id,
    position: Cartesian3.fromDegrees(pt.long, pt.lat),
    billboard: {
      image: "yellow_glow.png",
      scaleByDistance: new NearFarScalar(2e6, 1.0, 6e6, 0.5),
      verticalOrigin: VerticalOrigin.BOTTOM,
    },
  });
}
