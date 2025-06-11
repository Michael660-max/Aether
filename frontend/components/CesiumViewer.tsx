import buildModuleUrl from "@cesium/engine/Source/Core/buildModuleUrl";
import { useEffect, useRef, useState } from "react";
import {
  Viewer,
  Ion,
  EllipsoidTerrainProvider,
  IonImageryProvider,
  SkyBox,
  Cartesian3,
  NearFarScalar,
  VerticalOrigin,
  ScreenSpaceEventHandler,
  Cartesian2,
  ScreenSpaceEventType,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import usePointMarkers, { Point } from "../hooks/usePointMarkers";
import PointDetailModel from "./PointDetailModel";
import CreatePointModal from "./CreatePointModal";

buildModuleUrl.setBaseUrl(
  "https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/"
);

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer>();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [newCoords, setNewCoords] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  // usePointMarkers({
  //   viewer: viewer ?? undefined,
  //   onSelect: setSelectedPoint,
  //   onCreate: setNewCoords,
  // });

  useEffect(() => {
    let cesiumViewer: Viewer;
    let clickHandler: ScreenSpaceEventHandler;

    // Setup viewer
    (async () => {
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN!;

      const terrainProvider = new EllipsoidTerrainProvider();
      const bingLabels = await IonImageryProvider.fromAssetId(3);

      cesiumViewer = new Viewer(containerRef.current!, {
        terrainProvider,
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        navigationInstructionsInitiallyVisible: false,
      });

      console.log("[CesiumViewer] created Viewer", cesiumViewer);
      setViewer(cesiumViewer);

      // Add imagery + name of the globe
      cesiumViewer.imageryLayers.removeAll();
      cesiumViewer.imageryLayers.addImageryProvider(bingLabels);

      // Add background space image
      cesiumViewer.scene.skyBox = new SkyBox({
        sources: {
          positiveX: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_px.jpg"
          ),
          negativeX: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_mx.jpg"
          ),
          positiveY: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_py.jpg"
          ),
          negativeY: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_my.jpg"
          ),
          positiveZ: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_pz.jpg"
          ),
          negativeZ: buildModuleUrl(
            "Assets/Textures/SkyBox/tycho2t3_80_mz.jpg"
          ),
        },
      });

      console.log("🔧 Attaching click handler to Cesium canvas");
      clickHandler = new ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
      clickHandler.setInputAction((evt: { position: Cartesian2 }) => {
        console.log("🌍 Cesium click at", evt.position);
        // here you’d branch into onSelect() vs onCreate()
      }, ScreenSpaceEventType.LEFT_CLICK);
    })();

    return () => {
      if (cesiumViewer && !cesiumViewer.isDestroyed()) cesiumViewer.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100vh",
          margin: 0,
          padding: 0,
          border: 0,
        }}
      />
      {newCoords && (
        <CreatePointModal
          coords={newCoords!}
          onSubmit={(data) => {
            axios.post(`${API}/points`, data).then(() => {
              setNewCoords(null);
              viewer?.entities.add({
                position: Cartesian3.fromDegrees(data.long, data.lat),
                billboard: {
                  image: "yellow_glow.png",
                  scaleByDistance: new NearFarScalar(2e6, 1.0, 6e6, 0.5),
                  verticalOrigin: VerticalOrigin.BOTTOM,
                },
              });
            });
          }}
          onCancel={() => setNewCoords(null)}
        ></CreatePointModal>
      )}
      {selectedPoint && (
        <PointDetailModel
          point={selectedPoint!}
          onClose={() => setSelectedPoint(null)}
        ></PointDetailModel>
      )}
    </>
  );
}
