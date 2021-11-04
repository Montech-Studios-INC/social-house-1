import React, {useState, useEffect, useReducer} from "react";
import { useNFTMetadata } from "@zoralabs/nft-hooks";
import { FetchStaticData, MediaFetchAgent} from "@zoralabs/nft-hooks";
import { Row, Col, Tooltip } from "antd";
import { useNFT } from "@zoralabs/nft-hooks";
import { formatEther } from "@ethersproject/units";
import Link from "next/link";
import Timestamp from 'react-timestamp'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import VideoAudioText from '../VideoAudioText'
import NFTGeneralDetails from '../NFTGeneralDetails'
import AuctionDetails from '../AuctionDetails'
import {pageReducer, imgReducer} from '../../helpers/reducers'

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
  const [tokenData, imgDispatch] = useReducer(imgReducer, {
    token: [],
    fetching: true,
  });
  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
  useFetch(pager, imgDispatch, id, contract);

  const { data, error } = useNFT(contract, id);
  const { metadata } = useNFTMetadata(data?.nft?.metadataURI);

  
  return (
    <>
      <div className='flex flex-col '>
       <VideoAudioText tokenData={tokenData} tokenInfo={tokenInfo} data={data}/>
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

            <NFTGeneralDetails  tokenData={tokenData} tokenInfo={tokenInfo} data={data} metadata={metadata} />

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
                {(data?.pricing?.reserve?.previousBids.length === 0 || data?.pricing?.reserve === undefined) && (<div className="p-5"><p className="text-gray-500">There is no History for this NFT</p></div>)}
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
          <AuctionDetails data={data} tokenInfo={tokenInfo} tokenData={tokenData}>
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
          </AuctionDetails>
        </div>
      </div>
    </>
  );
};

export default Token;
