import "../styles/globals.css";
import "cesium/Build/Cesium/Widgets/widgets.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
