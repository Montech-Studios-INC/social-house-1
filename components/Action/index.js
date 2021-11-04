import React, { useState, useEffect, useReducer} from "react";
import { useRouter } from "next/router";
import { useNFTMetadata } from "@zoralabs/nft-hooks";
import { FetchStaticData,MediaFetchAgent} from "@zoralabs/nft-hooks";
import { notification } from "antd";
import { useNFT } from "@zoralabs/nft-hooks";
import moment from 'moment';
import { Zora } from "@zoralabs/zdk";
import { ethers } from "ethers";
import { AuctionHouse } from "@zoralabs/zdk";
import { useEthers } from "@usedapp/core";
import Countdown from 'react-countdown'
import { formatEther, parseEther } from "@ethersproject/units";
import VideoAudioText from '../VideoAudioText'
import NFTGeneralDetails from '../NFTGeneralDetails'
import ManageModal from './ManageModal';
import {pageReducer, imgReducer} from '../../helpers/reducers';


let tokenInfo;


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
  const { account } = useEthers();

  useEffect(async () => {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(provider.getSigner());
    }
  }, []);

  const handleListItem = async (amount, curatorFee, duration, setLoading) => {
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
    setVisible(false)
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


  const [tokenData, imgDispatch] = useReducer(imgReducer, {
    token: [],
    fetching: true,
  });
  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
  useFetch(pager, imgDispatch, id, contract);

  const { data, error } = useNFT(contract, id);
  const { metadata } = useNFTMetadata(data?.nft?.metadataURI);

  setTimeout(() => {
    setLoading(false);
  }, 3000);

  return (
      <>
          {account && (
        <div className="flex flex-col">

          <VideoAudioText tokenData={tokenData} tokenInfo={tokenInfo} data={data}/>

           <div className='flex flex-col-reverse lg:flex-row py-5 w-12/13 xl:w-2/3 m-auto'>
           <div className='flex flex-col w-full xl:w-1/2 lg:mr-2 '>
          
            <a href={`/token/${contract}/${id}`}>
            <div className='bg-gray-100 w-max flex justify-center items-center rounded-full p-3 cursor-pointer mt-3'>
            {/* collection */}
            <span className='ml-2 font-bold'>View Token</span>
            </div>
            </a>
            <NFTGeneralDetails  tokenData={tokenData} tokenInfo={tokenInfo} data={data} metadata={metadata} />
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
                       <Countdown date={moment.unix(data?.pricing?.reserve?.expectedEndTimestamp).format()} />
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
