import "../styles/reset.css";
import { css } from "@emotion/css";
import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import "../node_modules/video-react/dist/video-react.css";
import "antd/dist/antd.css";
import { GlobalProvider } from "../contexts/provider";
import { NetworkIDs } from "@zoralabs/nft-hooks";
import { MediaConfiguration } from "@zoralabs/nft-components";
import { Web3ConfigProvider } from "@zoralabs/simple-wallet-provider";

import { mediaConfigurationStyles } from "../styles/theme";
import GlobalStyles from "../styles/GlobalStyles";
import { Footer } from "../components/Footer";
import { DAppProvider, ChainId } from "@usedapp/core";
import NProgress from "nprogress";
import Router from "next/router";

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const config = {
  readOnlyChainId: ChainId.Rinkeby,
  readOnlyUrls: {
    [ChainId.Rinkeby]: process.env.NEXT_PUBLIC_RPC_URL,
  },
};

export default function CreateAuctionHouseApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyles />
      <GlobalProvider>
        <DAppProvider config={config}>
          <Web3ConfigProvider
            networkId={parseInt(process.env.NEXT_PUBLIC_NETWORK_ID, 10)}
            rpcUrl={process.env.NEXT_PUBLIC_RPC_URL || undefined}
          >
            <MediaConfiguration
              networkId={process.env.NEXT_PUBLIC_NETWORK}
              style={mediaConfigurationStyles}
            >
              <main>
                <Component {...pageProps} />
              </main>
            </MediaConfiguration>
          </Web3ConfigProvider>
        </DAppProvider>
      </GlobalProvider>
    </>
  );
}
