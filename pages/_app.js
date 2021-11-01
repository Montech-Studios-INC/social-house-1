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
import { useEffect, useState } from 'react'

import Loading from '../components/Loading'
import { mediaConfigurationStyles } from "../styles/theme";
import GlobalStyles from "../styles/GlobalStyles";
import { Footer } from "../components/Footer";
import { DAppProvider, ChainId } from "@usedapp/core";
import NProgress from "nprogress";
import Router, { useRouter } from "next/router";


export default function CreateAuctionHouseApp({ Component, pageProps }) {

  const router = useRouter()

  const [state, setState] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  })

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: true,
        loadingKey: prevState.loadingKey ^ 1,
      }))
    }

    const handleRouteChangeEnd = () => {
      setState((prevState) => ({
        ...prevState,
        isRouteChanging: false,
      }))
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeEnd)
    router.events.on('routeChangeError', handleRouteChangeEnd)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeEnd)
      router.events.off('routeChangeError', handleRouteChangeEnd)
    }
  }, [router.events])

  const config = {
    readOnlyChainId: ChainId.Rinkeby,
    readOnlyUrls: {
      [ChainId.Rinkeby]: process.env.NEXT_PUBLIC_RPC_URL,
    },
  };

  return (
    <>
    <Loading isRouteChanging={state.isRouteChanging} key={state.loadingKey} />
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
