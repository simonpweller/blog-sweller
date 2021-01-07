import "../styles/globals.css";
import "prismjs/themes/prism-tomorrow.css";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
