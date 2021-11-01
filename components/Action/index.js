import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
} from "react";
import { NFTPreview } from "@zoralabs/nft-components";
import { useRouter } from "next/router";
import Wrapper from "../Wrapper/index";
import { useZNFT, useNFTMetadata } from "@zoralabs/nft-hooks";
import { MediaConfiguration } from "@zoralabs/nft-components";
import {
  FetchStaticData,
  MediaFetchAgent,
  NetworkIDs,
} from "@zoralabs/nft-hooks";
import { Image, Row, Col, Modal, notification } from "antd";
import { useNFT } from "@zoralabs/nft-hooks";
import Link from "next/link";
import { noImage } from "../../helpers/no-image";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import ReactAudioPlayer from "react-audio-player";
import { profiles, highestBid, nftHistory, nftDetails } from "../Nav/dummyData";
import { Player } from 'video-react';
import ReactPlayer from "react-player";
import moment, { duration } from 'moment';
import Timestamp from 'react-timestamp'
import { Zora } from "@zoralabs/zdk";
import { Wallet, ethers, BigNumberish, BigNumber } from "ethers";
import { AuctionHouse, Decimal } from "@zoralabs/zdk";
import { useEthers, useEtherBalance } from "@usedapp/core";
import Countdown from 'react-countdown'
import { formatEther, parseEther } from "@ethersproject/units";

let tokenInfo;

const ManageModal = ({setVisible, visible, handleEndAuction, auctionId, handleCancelAuction, status, handleListItem}) => {

    const [amount, setAmount] = useState(0)
    const [curatorAddress, setCuratorAddress] = useState('')
    const [curatorFee, setCuratorFee] = useState(0)
    const [duration, setDuration] = useState(0)
    const [loading, setLoading] = useState(false)

    // console.log(duration)
    const showModal = () => {
        setVisible(true);
    };
  
    const handleOk = () => {
        setVisible(false);
    };
  
    const handleCancel = () => {
        setVisible(false);
    };  

    return (
        <>
        {status === "Active" && (<Modal title="Basic Modal" visible={visible} onOk={handleOk} onCancel={handleCancel}>
            <div>
            <div className="flex flex-row justify-between">
                <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleCancelAuction(auctionId)}}>Cancel Auction</button>
                <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleEndAuction(auctionId)}} >End Auction</button>
            </div>
            </div>
        </Modal>)
        }
        {status !== "Active" ? (
            <div class='w-full my-2 flex flex-col items-center content-center'>
            <div class='mb-4 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='name'
              >
                Reserve Price
              </label>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Reserve price'
                type='text'
                placeholder='Reserve price'
              />
            </div>

            <div class='mb-6 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                Curator Fee percentage
              </label>
              <input
                value={curatorFee}
                onChange={(e) => {
                  setCuratorFee(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Curator fee percentage'
                type='text'
                placeholder='Curator fee percentage'
              />
            </div>
            <div class='mb-6 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                Duration
              </label>
              <input
                value={duration}
                onChange={(e) => {
                setDuration(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Curator fee percentage'
                type='Number'
                placeholder='Curator fee percentage'
              />
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                In Seconds
              </label>
            </div>
            <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleListItem(amount, curatorAddress, curatorFee, duration , setLoading)}}>{!loading ? (
                  "List NFT"
                ) : (
                  <Row justify='center'>
                    <img
                      className='text-white w-5 h-5 animate-spin mx-4 text-center'
                      src='/images/spinner.png'
                    />
                  </Row>
                )}
            </button>
          </div>
        ) : ''}
        </>
    )
}


export const useFetch = (data, dispatch, id, contract) => {
  useEffect(() => {
    dispatch({ type: "FETCHING_TOKEN", fetching: true });

    const fetchAgent = new MediaFetchAgent(process.env.NEXT_PUBLIC_NETWORK_ID);
    const token = FetchStaticData.fetchZoraIndexerItem(fetchAgent, {
      tokenId: id,
      collectionAddress: contract,
    })
      .then((token) => {
        tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
        dispatch({ type: "STACK_TOKEN", token });
        dispatch({ type: "FETCHING_TOKEN", fetching: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, data.page]);
};

const Action = ({ id, contract, name }) => {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const [signer, setSigner] = useState({});
  const {
    activateBrowserWallet,
    account,
    chainId,
    deactivate,
    activate,
    active,
    library,
  } = useEthers();

  useEffect(async () => {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(provider.getSigner());
      // other stuff using provider here
    }
  }, []);

  const getAuction = async (auctionId) => {
    const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));

    const auctionHouse = new AuctionHouse(
      signer,
      parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)
    );
    const auction = await auctionHouse.fetchAuction(auctionId);
  };


  const handleListItem = async (amount, curatorAddress, curatorFee, duration, setLoading) => {
    setLoading(true)
    const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)) 
  
    const auctionHouse = new AuctionHouse(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));

    
    try {
    const approvalTx = await zora.approve(auctionHouse.auctionHouse.address, id)

    await approvalTx.wait()

    const createAuctionTx = await auctionHouse.createAuction(
    id,
    duration,
    parseEther(amount.toString()),
    '0x0000000000000000000000000000000000000000',
    curatorFee ? curatorFee : 0,
    '0x0000000000000000000000000000000000000000',
    )
    setLoading(false)
    router.reload()
    }
    catch(error){
        console.log(error)
        setLoading(false)
        notification['error']({
            message: 'Error Canceling Auction!',
            description:
            error.message.length > 200 ? error.message.substring(115, 160) : 'Something went wrong',
          });
    }

  }

  const handleEndAuction = async (auctionId) => {  
    const auctionHouse = new AuctionHouse(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));
    try{
    await auctionHouse.endAuction(auctionId)
    notification['success']({
        message: 'Ended an auction!',
        description: 'The NFT will be transfered to the winner'
      });
    }
    catch(error){
        console.log(error);
        notification['error']({
            message: 'Error Canceling Auction!',
            description:
            error.message.length > 200 ? error.message.substring(115, 160) : 'Something went wrong',
          });
    }
  }

    const handleCancelAuction = async (auctionId) => {  
    const auctionHouse = new AuctionHouse(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));
    try{
    await auctionHouse.cancelAuction(auctionId)
    notification['success']({
        message: 'Canceled an auction!',
        description: 'The NFT will be returned to the owner'
      });
    }
    catch(error){
        console.log(error);
        notification['error']({
            message: 'Error Canceling Auction!',
            description:
            error.message.length > 200 ? error.message.substring(115, 160) : 'Something went wrong',
          });
    }
  }


  const imgReducer = (state, action) => {
    switch (action.type) {
      case "STACK_TOKEN":
        return { ...state, token: state.token.concat(action.token) };
      case "FETCHING_TOKEN":
        return { ...state, fetching: action.fetching };
      default:
        return state;
    }
  };

  const pageReducer = (state, action) => {
    switch (action.type) {
      case "ADVANCE_PAGE":
        return { ...state, page: state.page + 1 };
      default:
        return state;
    }
  };

  const [tokenData, imgDispatch] = useReducer(imgReducer, {
    token: [],
    fetching: true,
  });
  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
  useFetch(pager, imgDispatch, id, contract);

  const { data, error } = useNFT(contract, id);
  const { metadata } = useNFTMetadata(data && data.metadataURI);

  setTimeout(() => {
    setLoading(false);
  }, 3000);

  console.log(tokenData, tokenInfo);

  return (
      <>
          {account && (
        <div className="flex flex-col">

        <div
             className={`my-12 bg-gray-200 w-full ${
               tokenData.fetching ? "h-96" : "h-auto"
             } p-10 flex flex-col items-center justify-around`}
           >
            {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
            (!tokenInfo?.metadata?.body && tokenInfo?.metadata?.mimeType?.split("/")[0] !== "audio" && tokenInfo?.metadata?.mimeType?.split("/")[0] !== "video")) && (
            <div className={`my-5 ${tokenData.fetching ? "" : ""}`}>
              {!tokenData.fetching ? (
                <Image 
                  src={tokenInfo?.image}
                  fallback={noImage}
                  preview={false}
                />
              ) : (
                <img
                  className='text-white w-10 h-10 animate-spin mx-4 text-center z-20'
                  src='/images/spinner-of-dots.png'
                />
              )}
              {/* <div className='w-full my-4'>
                <div className='bg-white rounded-full w-12 h-12 m-auto flex justify-center items-center cursor-pointer'>
                  <i class='fas fa-expand text-lg'></i>
                </div>
              </div> */}
            </div>
          )}
             {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "audio" ||
               tokenInfo?.metadata?.body?.mimeType?.split("/")[0] === "audio") && (
                 <div
                   className={`my-5 flex flex-row justify-between ${
                     tokenData.fetching ? "" : ""
                   }`}
                 >
                   {!tokenData.fetching ? (
                     <div className='flex flex-col md:flex-row items-center'>
                       <img
                         className='rounded-t-lg w-80 h-80 mb-4 md:mr-4'
                         src={tokenInfo.metadata?.body?.artwork?.info?.uri || tokenInfo?.image}
                         fallback={noImage}
                       />
                       <ReactAudioPlayer src={data?.zoraNFT.contentURI || tokenInfo?.image} controls />
                     </div>
                   ) : (
                     <img
                       className='text-white w-10 h-10 animate-spin mx-4 text-center z-20'
                       src='/images/spinner-of-dots.png'
                     />
                   )}
                 </div>
               )}
   
             {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "video" ||
               tokenInfo?.metadata?.body?.mimeType?.split("/")[0] === "video") && (
                 <div
                   className={`my-5 flex flex-row justify-between ${
                     tokenData.fetching ? "" : ""
                   }`}
                 >
                   {!tokenData.fetching ? (
                     <div className='flex flex-col md:flex-row items-center'>
                       {tokenInfo?.metadata?.image_url !== '' && (
                         <img
                         className='rounded-t-lg w-80 h-80 mb-4 md:mr-4'
                         src={tokenInfo?.metadata?.image_url || tokenInfo.metadata?.body?.artwork?.info?.uri}
                         fallback={noImage}
                       />
                       )}
                       
                       <ReactPlayer
                       url={data?.zoraNFT.contentURI || tokenInfo?.image}
                       playing loop
                     />
                     </div>
                   ) : (
                     <img
                       className='text-white w-10 h-10 animate-spin mx-4 text-center z-20'
                       src='/images/spinner-of-dots.png'
                     />
                   )}
                 </div>
               )}
             {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
               <div
                 className={`my-5 flex flex-row justify-between ${
                   tokenData.fetching ? "" : ""
                 }`}
               >
                 {!tokenData.fetching ? (
                   <>
                     <Image
                       align='center'
                       preview={false}
                       height={600}
                       className=' object-cover  rounded-t-lg w-full'
                       src={tokenInfo?.metadata?.image}
                       fallback={noImage}
                     />
                   </>
                 ) : (
                   <img
                     className='text-white w-10 h-10 animate-spin mx-4 text-center z-20'
                     src='/images/spinner-of-dots.png'
                   />
                 )}
               </div>
             )}
           </div>
           <div className='flex flex-col-reverse lg:flex-row py-5 w-12/13 xl:w-2/3 m-auto'>
           <div className='flex flex-col w-full xl:w-1/2 lg:mr-2 '>
          
            <a href={`/token/${contract}/${id}`}>
            <div className='bg-gray-100 w-max flex justify-center items-center rounded-full p-3 cursor-pointer mt-3'>
            {/* collection */}
            <span className='ml-2 font-bold'>View Token</span>
            </div>
            </a>
        
   
               <div className='flex flex-col'>
                 {tokenInfo?.metadata?.name && (
                   <div className='my-5'>
                     <p className='text-4xl font-bold w-11/12'>
                       {tokenInfo?.metadata?.name}
                     </p>
                   </div>
                 )}
                 {tokenInfo?.metadata?.body && (
                   <div className='my-5'>
                     <p className='text-4xl font-bold w-11/12'>
                       {tokenInfo?.metadata?.body?.title}
                     </p>
                   </div>
                 )}
                 {tokenData.fetching && (
                   <div className='my-5'>
                     <div className='bg-gray-200 w-32 animate-pulse h-6 rounded-md'></div>
                   </div>
                 )}
                 {tokenInfo?.metadata?.description && (
                   <div className='my-5'>
                     <p className='text-sm font-light w-11/12'>
                       {tokenInfo?.metadata?.description}
                     </p>
                   </div>
                 )}
                 {tokenData.fetching && (
                   <div className='my-5'>
                    <div className='bg-gray-200 w-11/12 animate-pulse h-6 my-2 rounded-md'></div>
                    <div className='bg-gray-200 w-11/12 animate-pulse h-6 my-2 rounded-md'></div>
                    <div className='bg-gray-200 w-11/12 animate-pulse h-6 my-2 rounded-md'></div>
                   </div>
                 )}
               </div>
           </div>
           <div className='w-full xl:w-4/12'>
               {/* auction details */}
               <div
                 className='static md:sticky md:top-28 rounded-lg p-4'
                 style={{ border: "2px solid #EBEBEB" }}
               >
                 {data?.pricing?.reserve?.status === "Active" && (
                   <div>
                     <div className='flex flex-col mb-5'>
                       <span className='text-gray-400 text-xs mb-2 font-bold'>
                         HIGHEST BID
                       </span>
                       <p className='font-bold text-2xl'>
                         {data?.pricing?.reserve?.current.highestBid?.pricing
                           .amount
                           ? parseFloat(
                               formatEther(
                                 data?.pricing?.reserve?.current.highestBid
                                   ?.pricing.amount
                               )
                             ).toFixed(3) +
                             data?.pricing?.reserve?.current.highestBid?.pricing
                               .currency.symbol
                           : "No Bid Yet!"}
                       </p>
                     </div>
                     <div className='mb-5'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                         Status
                       </p>
                       <div className='flex flex-row'>
                       {data?.pricing?.reserve?.status}
                       </div>
                     </div>
                     {data?.pricing?.reserve?.expectedEndTimestamp && (
                    <div className='mb-5'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                         AUCTION ENDS
                       </p>
                       <div className='flex flex-row'>
                       {moment.unix(data?.pricing?.reserve?.expectedEndTimestamp).format('LL')}
                         <div className='inline-block ml-2 mt-1 shadow-md animate-ping bg-red-500 w-1 h-1 rounded-full '></div>
                       </div>
                     </div>
                     )}
                     
                     <div className='mb-5'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                         Approved At
                       </p>
                       </p>
                       <div className='flex flex-row'>
                       {/* <Timestamp className='font-bold text-base' date={data.pricing.reserve.approvedTimestamp} />  */}
                       {moment.unix(data.pricing.reserve.approvedTimestamp).format('LL')}
                       </div>
                     </div>
                     <div className='mb-5'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                       <p className='text-gray-400 text-xs mb-2 font-bold'>
                         Reserve Price
                       </p>
                       </p>
                       <div className='flex flex-row'>
                       {/* <Timestamp className='font-bold text-base' date={data.pricing.reserve.approvedTimestamp} />  */}
                       {data.pricing.reserve.reservePrice.prettyAmount} {data.pricing.reserve.reservePrice.currency.symbol}
                       </div>
                     </div>
                   </div>
                 )}
   
                 {data?.pricing?.reserve?.status === "Finished" &&  data?.pricing?.status !== 'NO_PRICING' && (
                   <div className='flex flex-col mb-5'>
                   <p className='text-gray-400 text-xs mb-2 font-bold'>
                       {data?.pricing?.status}
                     </p>
                     <hr />
                     <p className='text-gray-400 text-xs mb-2 font-bold'>
                       SOLD
                     </p>
                     <span className='font-bold text-2xl'>
                       {data?.pricing?.reserve?.previousBids[0].pricing.prettyAmount
                         ? parseFloat(
                               data?.pricing?.reserve?.previousBids[0].pricing.prettyAmount
                           ).toFixed(3) +
                           data?.pricing?.reserve?.previousBids[0].pricing.currency
                             .symbol
                         : "Sold"}
                     </span>
                   </div>
                 )}
                 <ManageModal visible={visible} setVisible={setVisible} handleListItem={handleListItem} handleEndAuction={handleEndAuction} handleCancelAuction={handleCancelAuction} auctionId={tokenData?.token[0]?.nft?.auctionData?.id} status={data?.pricing?.reserve?.status} />
                 <hr />
                 {data?.pricing?.reserve?.status === "Active" && (
                     <button onClick={()=>{setVisible(true);}}
                       className={`bg-black text-white font-bold rounded px-4 py-4 outline-none w-full mt-4`}
                     >
                       Manage
                     </button>
                 )}
                 {/* {data?.pricing?.reserve?.status === "Finished" && (
                     <button onClick={()=>{setVisible(true);}}
                       className={`bg-black text-white font-bold rounded px-4 py-4 outline-none w-full mt-4`}
                     >
                       List for Auction
                     </button>
                 )} */}

                 {data?.pricing?.reserve?.status === "Pending" && (<div className='mb-5'>
                       <p className='font-bold text-2xl'>
                         Status
                       </p>
                       <div className='flex flex-row'>
                       <span className='text-gray-400 text-xs mb-2 font-bold'>{data?.pricing?.reserve?.status}</span>
                       </div>
                     </div>)}
                 
               </div>
             </div>
           </div>
       </div>
        )}
    
    </>
  );
};

export default Action;
