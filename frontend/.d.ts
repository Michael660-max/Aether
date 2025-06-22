// cesium-engine.d.ts

declare module "@cesium/engine/Source/Core/buildModuleUrl" {
  /**
   * This module exposes a single object with a .setBaseUrl() method
   * that Cesium uses to know where to find its static assets.
   */
  const buildModuleUrl: {
    /**
     * Point Cesium at the base URL (e.g. the CDN or your public folder).
     */
    setBaseUrl(url: string): void;
  };
  export default buildModuleUrl;
}
