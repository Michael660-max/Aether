import { useEffect, useRef, useState } from "react";
import axios from "axios";
import buildModuleUrl from "@cesium/engine/Source/Core/buildModuleUrl";
import {
  Viewer,
  Ion,
  EllipsoidTerrainProvider,
  IonImageryProvider,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  VerticalOrigin,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import CreatePointModal from "./CreatePointModal";
import PointDetailModel from "./PointDetailModel";

buildModuleUrl.setBaseUrl(
  "https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/"
);

type Coords = { lat: number; long: number };

type Photo = {
  url: string;
  caption?: string;
};

type Point = {
  _id: string;
  lat: number;
  long: number;
  descriptor?: string;
  tags: string[];
  photos: Photo[];
};

const API = process.env.NEXT_PUBLIC_API_URL!;

function initViewer(container: HTMLDivElement): Viewer {
  // Create globe
  Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN!;
  const terrainProvider = new EllipsoidTerrainProvider();
  const viewer = new Viewer(container, {
    terrainProvider,
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    homeButton: false,
    fullscreenButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    geocoder: true,
    infoBox: false,
    selectionIndicator: false,
  });
  viewer.scene.globe.enableLighting = false;

  return viewer;
}

async function addImagery(cesiumViewer: Viewer) {
  // Add imagery to globe
  const bingLabels = await IonImageryProvider.fromAssetId(3);
  if (!cesiumViewer.imageryLayers) return;
  cesiumViewer.imageryLayers.addImageryProvider(bingLabels);
}

async function loadPoints(viewer: Viewer): Promise<Point[]> {
  // Load existing points from DB
  const res = await axios.get<Point[]>(`${API}/points`);
  const points = res.data || [];
  for (const pt of points) {
    viewer.entities.add({
      id: pt._id,
      position: Cartesian3.fromDegrees(pt.long, pt.lat),
      billboard: {
        image: "/icons/location.png",
        scale: 0.05,
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
    });
  }
  return points;
}

function attachClickHandler(
  viewer: Viewer,
  existingPoints: Point[],
  onSelect: (pt: Point) => void,
  onCreate: (coords: Coords) => void
): ScreenSpaceEventHandler {
  // Handle select/create point
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((evt: { position: Cartesian2 }) => {
    const pick = viewer.scene.pick(evt.position);
    if (pick?.id) {
      const pt = existingPoints.find((p) => p._id === pick.id.id);
      if (pt) onSelect(pt);
    } else {
      const cart = viewer.camera.pickEllipsoid(
        evt.position,
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
  return handler;
}

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer>();
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [newCoords, setNewCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let viewerInstance: Viewer;
    let handler: ScreenSpaceEventHandler;

    (async () => {
      viewerInstance = initViewer(containerRef.current!);
      setViewer(viewerInstance);

      try {
        await addImagery(viewerInstance);
        const pts = await loadPoints(viewerInstance);
        setPoints(pts);

        handler = attachClickHandler(
          viewerInstance,
          pts,
          setSelectedPoint,
          setNewCoords
        );
      } catch (err) {
        console.log("error: " + err);
      }
    })();

    return () => {
      handler?.destroy();
      if (viewerInstance && !viewerInstance.isDestroyed()) {
        viewerInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((evt: { position: Cartesian2 }) => {
      const pick = viewer.scene.pick(evt.position);
      if (pick?.id) {
        // Local array points instead of querying inital points
        const pt = points.find((p) => p._id === pick.id.id);
        if (pt) setSelectedPoint(pt);
      } else {
        const cart = viewer.camera.pickEllipsoid(
          evt.position,
          viewer.scene.globe.ellipsoid
        );
        if (cart) {
          const c = Cartographic.fromCartesian(cart);
          setNewCoords({
            lat: CesiumMath.toDegrees(c.latitude),
            long: CesiumMath.toDegrees(c.longitude),
          });
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }, [viewer, points]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />

      {newCoords && (
        <CreatePointModal
          coords={newCoords}
          onSubmit={async (data) => {
            const { data: newPt } = await axios.post<Point>(
              `${API}/points`,
              data
            );
            viewer?.entities.add({
              id: newPt._id,
              position: Cartesian3.fromDegrees(newPt.long, newPt.lat),
              billboard: {
                image: "/icons/location.png",
                scale: 0.05,
                verticalOrigin: VerticalOrigin.BOTTOM,
              },
            });
            setPoints((ps) => [...ps, newPt]);
            setNewCoords(null);
          }}
          onCancel={() => setNewCoords(null)}
        />
      )}

      {selectedPoint && (
        <PointDetailModel
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </>
  );
}
