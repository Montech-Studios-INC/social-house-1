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
import { Image, Row, Col, Modal, Tooltip } from "antd";
import { useNFT } from "@zoralabs/nft-hooks";
import { formatEther } from "@ethersproject/units";
import Link from "next/link";
import { noImage } from "../../helpers/no-image";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import ReactAudioPlayer from "react-audio-player";
import { profiles, highestBid, nftHistory, nftDetails } from "../Nav/dummyData";
import { Player } from 'video-react';
import ReactPlayer from "react-player";
import moment from 'moment';
import Timestamp from 'react-timestamp'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const array = [1, 2, 3, 4, 5, 6, 7, 8];
let tokenInfo;

const NFTdetails = ({label, value, link, isLink}) => {
  const [toolTip, setToolTip] = useState('Copy')
  return(
  <Row className='mb-4'>
  <Col span={12} className='font-bold text-base'>
    {label}
  </Col>
  <Col span={12} className='text-right text-base'>
    <span className='mr-5'>{value?.length >= 20 ? `${value?.slice(0,10)}...${value?.slice(value?.length - 4,value?.length)}` : value}</span>
    {isLink ? <a href={link} target="_blank"><i className='fas fa-external-link-alt text-gray-600' /></a> : ''}
    <CopyToClipboard text={value}
      onCopy={() => setToolTip('copied')}>
      <Tooltip placement="top" title={toolTip}>
      <i className='fas fa-copy text-gray-600 mx-2 cursor-pointer' />
      </Tooltip>
    </CopyToClipboard>
  </Col>
</Row>)
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

const Token = ({ id, contract }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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

  console.log(moment.unix(1639369502).format('l'))
  
  return (
    <>
      <div className='flex flex-col '>
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
          <div className='flex flex-col w-full xl:w-1/2 lg:mr-2'>
            {/* bid details */}
            {data?.zoraNFT && (
              <div className='bg-gray-100 w-max flex justify-center items-center rounded-full p-3 cursor-pointer mt-3'>
                {/* collection */}
                <img src='/fpo/favicon.png' className='w-7 h-7 rounded-full' />
                <span className='ml-2 font-bold'>ZORA</span>
              </div>
            )}

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
            <div className='flex flex-row my-6'>
              <div className='flex flex-col flex-1'>
                <p className='font-bold text-gray-500 mb-2 text-xs'>MINTER</p>
                <div className='flex items-center'>
                  <p className='font-bold ml-2'>
                    {data?.nft?.creator &&
                      `${data?.nft?.creator.slice(
                        0,
                        15
                      )}...${data?.nft?.creator.slice(
                        data?.nft?.creator.length - 4,
                        data?.nft?.creator.length
                      )}`}
                  </p>
                </div>
              </div>
              <div className='flex flex-col flex-1'>
                <p className='font-bold text-gray-500 mb-2 text-xs'>OWNER</p>
                <div className='flex items-center'>
                  <p className='font-bold ml-2'>
                    {data?.nft?.owner &&
                      `${data?.nft?.owner.slice(
                        0,
                        15
                      )}...${data?.nft?.owner.slice(
                        data?.nft?.owner.length - 4,
                        data?.nft?.owner.length
                      )}`}
                  </p>
                </div>
              </div>
            </div>

            <div
              className='tags p-4 my-5 w-12/13 rounded-lg'
              style={{ border: "2px solid #EBEBEB" }}
            >
              <div className='flex flex-row justify-between'>
                <span className='font-bold text-xs mb-3 text-gray-500'>
                  HISTORY
                </span>
              </div>
              <div className='flex flex-col'>
                {data?.pricing?.reserve?.previousBids.length === 0 && (<div className="p-5"><p className="text-gray-500">There is no History for this NFT</p></div>)}
                {data?.pricing?.reserve?.previousBids.length !== 0 && data?.pricing?.reserve?.previousBids.map((bid) => {
                  return (
                    <div key={bid.id} className='mb-4'>
                      <Row align='middle'>
                        <Col span={20} className='pl-3 font-bold'>
                        {bid.bidder.id &&
                      `${bid.bidder.id.slice(
                        0,
                        15
                      )}...${bid.bidder.id.slice(
                        bid.bidder.id.length - 4,
                        bid.bidder.id.length
                      )}`}
                          <span className='pl-2 text-gray-500 font-normal'>
                            {'Placed a bid'}
                          </span>
                          <div className='text-gray-500 text-xs font-normal mt-2'>
                            {/* {moment(bid.createdAtTimestamp).format('MMMM Do YYYY, h:mm:ss a')}{" "} */}
                             <Timestamp date={bid.createdAtTimestamp} /> 
                             <a href={`https://rinkeby.etherscan.io/tx/${bid.transactionHash}`} target="_blank">
                            <img
                              src={'https://zora.co/assets/icon/etherscan.svg'}
                              className='w-3 h-3 rounded-full inline mx-2'
                              alt='etherium_link'
                            />
                            </a>
                          </div>
                        </Col>
                        <Col span={3} className='font-bold text-xs  text-right'>
                          {parseFloat(formatEther(bid.pricing.amount)).toFixed(3)}{`${bid.pricing.currency.symbol}`}
                          <div
                            span={4}
                            className='text-gray-500 text-xs font-normal mt-2'
                          >
                            {bid.bidType}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className='tags p-4 my-5 w-12/13 rounded-lg'
              style={{ border: "2px solid #EBEBEB" }}
            >
              <div className='flex flex-row justify-between'>
                <span className='font-bold text-xs mb-3 text-gray-500'>
                  NFT DETAILS
                </span>
              </div>
              <div className='flex flex-col'>
                <NFTdetails  label='Contract Address' value={data?.nft?.contract?.address} link={`https://rinkeby.etherscan.io/address/${data?.nft?.contract?.address}`} isLink={true}/>
                <NFTdetails  label='Token ID' value={data?.nft?.tokenId}  isLink={false}/>
                <NFTdetails  label='Blockchain' value={'Ethereum'} isLink={false} />
                <NFTdetails  label='IPFS' value={''} link={`${data?.zoraNFT.contentURI}`} isLink={true}/>
                <NFTdetails  label='IPFS Metadata' value={''} link={`${data?.nft.metadataURI}`} isLink={true}/>
              </div>
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
                    {data?.pricing?.reserve?.previousBids[0]?.pricing?.prettyAmount
                         ? parseFloat(
                               data?.pricing?.reserve?.previousBids[0]?.pricing.prettyAmount
                           ).toFixed(3) +
                           data?.pricing?.reserve?.previousBids[0]?.pricing?.currency
                             .symbol
                         : "Not sold yet"}
                    </p>
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
                       {moment.unix(data?.pricing?.reserve?.approvedTimestamp).format('LL')}
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
                       {data.pricing.reserve.reservePrice.prettyAmount}
                       </div>
                     </div>
                </div>
              )}

              {data?.pricing?.reserve?.status === "Finished" && (
                <div className='flex flex-col mb-5'>
                  <p className='text-gray-400 text-xs mb-2 font-bold'>
                    SOLD
                  </p>
                  <span className='font-bold text-2xl'>
                    {data?.pricing?.perpetual?.highestBid?.pricing.amount
                      ? parseFloat(
                          formatEther(
                            data?.pricing?.perpetual?.highestBid?.pricing.amount
                          )
                        ).toFixed(3) +
                        data?.pricing?.perpetual?.highestBid?.pricing.currency
                          .symbol
                      : "Sold"}
                  </span>
                </div>
              )}

              <div className='flex flex-col mb-5'>
                <p className='text-gray-400 text-xs font-bold mb-2'>MINTER</p>
                <div className='flex items-center'>
                  <img
                    src={'/images/icon.png'}
                    className='w-7 h-7 rounded-full'
                  />
                  <p className='font-bold text-base ml-2'>
                    {data?.nft?.creator &&
                      `${data?.nft?.creator.slice(
                        0,
                        6
                      )}...${data?.nft?.creator.slice(
                        data?.nft?.creator.length - 4,
                        data?.nft?.creator.length
                      )}`}
                  </p>
                </div>
              </div>
              <div className='flex flex-col mb-5'>
                <p className='text-gray-400 text-xs mb-2 font-bold'>OWNER</p>
                <div className='flex items-center'>
                  <img
                    src={'/images/icon.png'}
                    className='w-7 h-7 rounded-full'
                  />
                  <p className='font-bold text-base ml-2'>
                    {data?.nft?.owner &&
                      `${data?.nft?.owner.slice(
                        0,
                        6
                      )}...${data?.nft?.owner.slice(
                        data?.nft?.owner.length - 4,
                        data?.nft?.owner.length
                      )}`}
                  </p>
                </div>
              </div>
              <hr />
              {data?.pricing?.reserve?.status === "Active" && (
                <Link
                  href={`/token/${tokenInfo?.tokenContract}/${tokenInfo?.tokenId}/auction/bid`}
                >
                  <button
                    className={`bg-black text-white font-bold rounded px-4 py-4 outline-none w-full mt-4`}
                  >
                    Place Bid
                  </button>
                </Link>
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
    </>
  );
};

export default Token;
