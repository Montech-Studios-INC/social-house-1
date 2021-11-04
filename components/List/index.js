import styled from "@emotion/styled";
import {
  AuctionManager,
  useManageAuction,
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
import { Row, Col, Progress, Image, notification } from "antd";
import { formatEther, parseEther } from "@ethersproject/units";
import useSWR from "swr";
import { useEthers, useEtherBalance } from "@usedapp/core";
import React, {
  useState,
  useEffect,
  Fragment,
  useContext,
  useReducer,
} from "react";
import { GlobalContext } from "../../contexts/provider";
import * as actions from "../../contexts/actions";
import { noImage } from "../../helpers/no-image";
import Link from "next/link";
import { useNFT, useZNFT } from '@zoralabs/nft-hooks'
import ReactPlayer from 'react-player'
import { Modal, Button } from 'antd';
import { MediaFetchAgent, Networks } from '@zoralabs/nft-hooks'
import { Tabs } from 'antd';
import Countdown from 'react-countdown';
import moment from 'moment';

const { TabPane } = Tabs;


const array = [1, 2, 3, 4, 5, 6, 7, 8];


const NFTModal = ({token, tokenInfo}) => {

  return (
    <div className="flex flex-row justify-between w-full px-2">
      <Link href={`/action/${token.nft.tokenData.address}/${token.nft.tokenData.tokenId}`}>
        <button className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-10/12 mx-2 my-2`} >List</button>
        </Link>
        <Link href={`/token/${token.nft.tokenData.address}/${token.nft.tokenData.tokenId}`}>
        <button className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-10/12 mx-2 my-2`} >View</button>
        </Link>
    </div>
  );
};

const EachNFT = ({tokenInfo, token}) => (<div className='w-full mx-2 sm:w-full md:w-1/2 lg:w-1/4 my-2'>
<div
  key={`${tokenInfo?.tokenId}`}
  className=' bg-white mb-5 rounded-lg flex flex-row flex-wrap border-2 border-gray-100 shadow-md hover:shadow-xd cursor-pointer w-full sm:w-full md:w-11/12'
>
  {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
    (!tokenInfo?.metadata?.body &&
      tokenInfo.metadata?.mimeType?.split("/")[0] !== "video")) && (
    <Image
      align='center'
      preview={false}
      height={300}
      width='100%'
      className='h-72 w-full object-cover card-img-top rounded-t-lg'
      src={tokenInfo.image}
      fallback={noImage}
    />
  )}
  {tokenInfo?.metadata?.mimeType?.split("/")[0] === "video" &&
    !tokenInfo?.metadata?.body && (
      <ReactPlayer
        width='100%'
        height='auto'
        url={tokenInfo?.image}
        playing
        loop
        className=' w-full object-cover card-img-top rounded-t-lg'
      />
    )}
  {tokenInfo?.metadata?.body &&
    tokenInfo?.metadata?.body?.mimeType.split("/")[0] === "audio" && (
      <Image
        height={300}
        width='100%'
        preview={false}
        className='h-72 w-full object-cover card-img-top rounded-t-lg'
        src={tokenInfo.metadata.body.artwork.info.uri}
        fallback={noImage}
      />
    )}
  {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
    <Image
      height={300}
      width='100%'
      preview={false}
      className='h-72 w-full object-cover card-img-top rounded-t-lg'
      src={tokenInfo.metadata.image}
      fallback={noImage}
    />
  )}
  {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
    <Image
      height={300}
      width='100%'
      preview={false}
      className='h-72 w-full object-cover card-img-top rounded-t-lg'
      src={tokenInfo.metadata.image}
      fallback={noImage}
    />
  )}
    <div className='p-4 w-full'>
      <Row align='middle' className='mb-2'>
        <Name token={token} tokenInfo={tokenInfo} />
        <Col span={12} align='right'>
          {tokenInfo?.metadata?.body ||
            (tokenInfo?.metadata?.mimeType?.split("/")[0] ===
              "audio" && (
              <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                <i class='fas fa-volume-up'></i>
              </div>
            ))}
          {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
            (!tokenInfo?.metadata?.body &&
              tokenInfo?.metadata?.mimeType?.split("/")[0] !== "video" &&
              tokenInfo?.metadata?.mimeType?.split("/")[0] !==
                "audio")) && (
            <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
              <i class='fas fa-image'></i>
            </div>
          )}
          {tokenInfo?.metadata?.mimeType?.split("/")[0] === "video" &&
            !tokenInfo?.metadata?.body && (
              <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                <i class='fas fa-video'></i>
              </div>
            )}
        </Col>
      </Row>
      <Row className='w-full mb-5' align='middle'>
        {token?.nft?.auctionData?.expectedEndTimestamp ?
        <>
           <Countdown date={moment.unix(token?.nft?.auctionData?.expectedEndTimestamp).format()} />
           <div className='inline-block ml-2 shadow-md animate-ping bg-red-500 w-1 h-1 rounded-full '></div>
        </>
        : 
        (
          <>
        <Col>
          <img
            src='/fpo/favicon.png'
            className='w-5 h-5 rounded-full'
          />
        </Col>
          <Col className='ml-2'>Zora</Col>
          </>
        )}
        
      </Row>
      <Row className='border-t-2 py-2 border-gray-200' align='middle'>
        {token.nft?.auctionData?.status === "Active" && (
          <Col span={12}>
            <span className='block text-gray-500 text-md'>
              Current Bid
            </span>
            <span className='font-bold text-md'>
              {token?.nft?.auctionData?.currentBid
                ? parseFloat(
                    formatEther(
                      token?.nft?.auctionData?.currentBid?.amount
                    )
                  ).toFixed(3) + " ETH"
                : "No bid yet"}
            </span>
          </Col>
        )}

        {(token?.nft?.auctionData?.status === "Finished" || token?.nft?.auctionData?.status === "Pending" || true)  && (
          <Col span={12}>
            <span className='block text-gray-500 text-md'>
              Status 
            </span>
            <span className='font-bold text-md'>
              {token?.nft?.auctionData?.status ? token?.nft?.auctionData?.status : 'Not listed'}
            </span>
          </Col>
        )}

              </Row>
            </div>
          <NFTModal token={token} tokenInfo={tokenInfo} />
        </div>
</div>)

const ListItemComponent = () => {
  const {
    nft: { data },
  } = useContext(NFTDataContext);

  const { openManageAuction, openListAuction, openBidAuction } =
    useManageAuction();

  if (!data || !data.nft) {
    return <Fragment />;
  }

  if (
    data.pricing.reserve?.status === "Active" ||
    data.pricing.reserve?.status === "Pending"
  ) {
    return (
      <button
        className='button'
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
      className='button'
    >
      List
    </button>
  );
};



const Name = ({token, tokenInfo}) => {
  return (
    <Col span={12} className='font-bold text-sm'>
      {tokenInfo?.metadata?.name }
      {tokenInfo?.metadata?.body?.title}
    </Col>
  );
};

const RenderOwnedList = ({ account, openModal }) => {
  const { data, error } = useSWR(`/api/ownedItems?owner=${account}`, (url) =>
    fetch(url).then((res) => res.json())
  );

  const [listed, setListed] = useState([])

  const filterListed = (data) => {
    const result = [];
    data?.tokens?.map((each)=>{
      if(each?.nft?.auctionData)
      {
        result.push(each)
      }
    })
    return result
  }

  useEffect(()=>{
    setListed(filterListed(data))
  }, [data])

console.log(listed)

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
      <div className='flex flex-col items-center justify-center w-full h-full'>
        <h2 className='text-red-800 text-3xl font-bold mb-4'>
          We couldn’t find any NFTs you own 😢
        </h2>
        <p className='mb-3'>
          You have no NFTs available to list for sale.Buy or create an NFT to
          get started.
        </p>
        <div className='flex flex-row justify-between'>
          <a href="/">
          <button
            className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-max mt-2`}
          >
            Explore marketplace
          </button>
          </a>
        </div>
      </div>
    );
  }

  console.log(data.tokens)

  if (data.tokens.length !== 0) {
  return (
    <Tabs defaultActiveKey="1">
    <TabPane tab="All NFTs" key="1">
    <div className="flex flex-row flex-wrap justify-around">
    {data?.tokens?.map((token) => {
    const tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
    return (

      <EachNFT tokenInfo={tokenInfo} token={token} />
    );
    })}
    </div>
    </TabPane>
    <TabPane tab="Listed NfTs" key="2">
    <div className="flex flex-row flex-wrap justify-around">
      {listed.length !== 0 ? listed?.map((token) => {
    const tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
    return (
      <EachNFT tokenInfo={tokenInfo} token={token} />
    );
  }) : (<p>You have not listed any NFT</p>)}
      </div>
    </TabPane>

    
  </Tabs>
  )
  }

};

const MediaThumbnailPreview = ({ tokenContract, tokenId }) => {
  return (
    // TODO(iain): Fix indexer in this use case
    <NFTPreview id={tokenId} contract={tokenContract} useBetaIndexer={true}>
      <div className='owned-list-item'>
        <PreviewComponents.MediaThumbnail />
        <div className='list-component-wrapper'>
          <ListItemComponent />
        </div>
      </div>
    </NFTPreview>
  );
};

export default function List() {
  const { activateBrowserWallet, account, chainId, deactivate, activate } =
    useEthers();
  const [isloggedin, setIsloggedin] = useState(false);

  useEffect(() => {
    if (account !== null && account !== undefined) {
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
    }
  }, [account, chainId]);

  const {
    showModalState: { showModal },
    setShowModal,
  } = useContext(GlobalContext);
  
  const openModal = () => {
    // setIsModalVisible(true);
    actions.changeAuthModal(!showModal)(setShowModal);
  };
  
  return (
    <>
      {account ? (
        <div className='pt-28 w-screen h-screen px-10'>
          <RenderOwnedList account={account} openModal={openModal} />
        </div>
      ) : (
        <div className='pt-20 flex flex-col justify-center items-center w-screen h-screen'>
          <p className='text-4xl font-bold text-center my-4 w-1/2'>
            Connect your wallet to list your NFT
          </p>
          <button
            onClick={openModal}
            className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}
          >
            Connect wallet
          </button>
          <p className='text-gray-600 my-4 cursor-pointer'>
            How to get a wallet!
          </p>
        </div>
      )}
    </>
  );
}
