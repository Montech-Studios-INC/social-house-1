import React from 'react'
import Link from "next/link";
import moment from 'moment';
import Countdown from 'react-countdown';

function AuctionDetails({data, tokenInfo, children}) {
    return (
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
                    {data?.pricing?.reserve?.currentBid?.pricing?.prettyAmount
                         ? parseFloat(
                               data?.pricing?.reserve?.currentBid?.pricing?.prettyAmount
                           ).toFixed(3) +
                           data?.pricing?.reserve?.currentBid?.pricing?.currency?.symbol
                         : "No Highest Bid yet"}
                    </p>
                  </div>
                  {data?.pricing?.reserve?.expectedEndTimestamp && (
                    <div className='mb-5'>
                    <p className='text-gray-400 text-xs mb-2 font-bold'>
                      AUCTION ENDS
                    </p>
                    <div className='flex flex-row'>
                    {/* {moment.unix(data?.pricing?.reserve?.expectedEndTimestamp).format('LL')} */}
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
                       {data.pricing.reserve.reservePrice.prettyAmount} {data.pricing.reserve.reservePrice.currency.symbol}
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
              {children}
            </div>
          </div>
    )
}

export default AuctionDetails
