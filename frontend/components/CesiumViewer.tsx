import buildModuleUrl from "@cesium/engine/Source/Core/buildModuleUrl";
import { useEffect, useRef } from "react";
import {
  Viewer,
  Ion,
  EllipsoidTerrainProvider,
  IonImageryProvider,
  UrlTemplateImageryProvider,
  GeographicTilingScheme,
  SkyBox,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

buildModuleUrl.setBaseUrl(
  "https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/"
);

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let viewer: Viewer;

    // Setup viewer
    (async () => {
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN!;

      const terrainProvider = new EllipsoidTerrainProvider();
      const naturalEarthLayer = new UrlTemplateImageryProvider({
        url:
          buildModuleUrl("Assets/Textures/NaturalEarthII") +
          "/{z}/{x}/{reverseY}.jpg",
        tilingScheme: new GeographicTilingScheme(),
        maximumLevel: 5,
      });
      const bingLabels = await IonImageryProvider.fromAssetId(3);

      viewer = new Viewer(containerRef.current!, {
        terrainProvider,
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: true,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        navigationInstructionsInitiallyVisible: false,
      });

      // Add imagery + name of the globe
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(naturalEarthLayer);
      viewer.imageryLayers.addImageryProvider(bingLabels);

      // Add background space image
      viewer.scene.skyBox = new SkyBox({
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
    })();

    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  return (
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
  );
}
