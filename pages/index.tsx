import Head from "../components/head";
import { GetStaticProps } from "next";

import { AuctionsList } from "../components/AuctionList";

import {
  FetchStaticData,
  MediaFetchAgent,
  NetworkIDs,
} from "@zoralabs/nft-hooks";
import { Header } from "../components/Header";

export default function Home() {
  return (
    <>
      <Head />
      <Header />
      <AuctionsList />
    </>
  );
}
