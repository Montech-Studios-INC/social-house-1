import styled from "@emotion/styled";
import {
  AuctionManager,
  useManageAuction
} from "@zoralabs/manage-auction-hooks";
import {
  NFTDataContext,
  NFTPreview,
  PreviewComponents,
} from "@zoralabs/nft-components";
import { FetchStaticData } from "@zoralabs/nft-hooks";
import {
  useWalletButton,
  useWeb3Wallet,
} from "@zoralabs/simple-wallet-provider";
import useSWR from "swr";
import { useEthers, useEtherBalance } from "@usedapp/core";
import React, {
  useState,
  useEffect,
  Fragment,
  useContext,
  useReducer,
} from "react";
import { GlobalContext } from '../../contexts/provider';
import * as actions from '../../contexts/actions';

const ListItemComponent = () => {
  const {
    nft: { data },
  } = useContext(NFTDataContext);

  const { openManageAuction, openListAuction, openBidAuction } = useManageAuction();

  if (!data || !data.nft) {
    return <Fragment />;
  }

  if (
    data.pricing.reserve?.status === "Active" ||
    data.pricing.reserve?.status === "Pending"
  ) {
    return (
      <button
        className="button"
        onClick={() => {
          const reserveId = data.pricing.reserve?.id;
          if (reserveId) {
            openManageAuction(parseInt(reserveId, 10));
          }
        }}
      >
        Manage
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        openListAuction(data.nft.contract.address, data.nft.tokenId);
      }}
      className="button"
    >
      List
    </button>
  );
};


const RenderOwnedList = ({ account, openModal }) => {
  const { data, error } = useSWR(
    `/api/ownedItems?owner=${account}`,
    (url) => fetch(url).then((res) => res.json())
  );

  if (!data) {
    // loading
    return <Fragment />;
  }
  if (error) {
    // error
    return <Fragment />;
  }

  if (data.tokens.length === 0) {
    return (
      <div className="owned-list-no-tokens">
        <h2 className="text-red-800">We couldn’t find any NFTs you own 😢</h2>
        <p>You have no NFTs available to list for sale.Buy or create an NFT to get started.</p>
        <div className="flex flex-row justify-between">
        <button className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}>Switch wallet</button>
        <button className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}>Explore marketplace</button>
        </div>
      </div>
    );
  }

  return data.tokens.map((token) => {
    const tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
    console.log(data)
    return (
      <NFTPreview
        id={tokenInfo.tokenId}
        contract={tokenInfo.tokenContract}
        initialData={token}
        useBetaIndexer={true}
        key={`${tokenInfo.tokenContract}-${tokenInfo.tokenId}`}
      >
        <div className="owned-list-item">
          <PreviewComponents.MediaThumbnail />
          <div className="list-component-wrapper">
            <ListItemComponent />
          </div>
        </div>
      </NFTPreview>
    );
  });
};

const MediaThumbnailPreview = ({
  tokenContract,
  tokenId,
}) => {
  return (
    // TODO(iain): Fix indexer in this use case
    <NFTPreview
      id={tokenId}
      contract={tokenContract}
      useBetaIndexer={true}
    >
      <div className="owned-list-item">
        <PreviewComponents.MediaThumbnail />
        <div className="list-component-wrapper">
          <ListItemComponent />
        </div>
      </div>
    </NFTPreview>
  );
};

export default function List() {
  const { activateBrowserWallet, account, chainId, error, deactivate, activate } = useEthers();
  const [isloggedin, setIsloggedin] = useState(false)
  
  useEffect(()=>{
    if(account !== null && account !== undefined){
        setIsloggedin(true)
    }
    else{
        setIsloggedin(false)
    }
}, [account, chainId])
  const {
    showModalState: {
     showModal,
   },
   setShowModal,
 } = useContext(GlobalContext);
  const openModal = () => {
    // setIsModalVisible(true);
    actions.changeAuthModal(!showModal)(setShowModal);
  };
  return (
    <>
          {account ?
          <div className="p-20 flex flex-row items-center w-full justify-around">
            <div className="owned-list mt-20">
              <RenderOwnedList account={account} openModal={openModal} />
            </div>
          </div>
          :
          <div className="mt-20 flex flex-col justify-around items-center">
              <p className="text-4xl font-bold text-center my-4 w-1/2">Connect your wallet to list your NFT</p>
              <button onClick={openModal} className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}>Connect wallet</button>
              <p className="text-gray-600 my-4 cursor-pointer">How to get a wallet!</p>
          </div>
          }
    </>
  );
}
