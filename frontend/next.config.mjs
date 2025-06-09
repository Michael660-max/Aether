// next.config.mjs
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias.cesium = path.resolve(
      'node_modules/cesium/Build/Cesium'
    );

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve('node_modules/cesium/Build/Cesium/Workers'),
            to: 'static/cesium/Workers',
          },
          {
            from: path.resolve('node_modules/cesium/Build/Cesium/Assets'),
            to: 'static/cesium/Assets',
          },
          {
            from: path.resolve('node_modules/cesium/Build/Cesium/Widgets'),
            to: 'static/cesium/Widgets',
          },
        ],
      })
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/_next/static/cesium'),
      })
    );

    return config;
  },
};
