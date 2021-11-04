import React from 'react'

function NFTGeneralDetails({tokenData, tokenInfo, metadata, data}) {
    return (
        <>
            <div className='flex flex-col'>
              {(tokenInfo?.metadata?.name || metadata?.name) && !tokenData.fetching && (
                <div className='my-5'>
                  <p className='text-4xl font-bold w-11/12'>
                    {tokenInfo?.metadata?.name || metadata?.name}
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
              {(tokenInfo?.metadata?.description || metadata?.description) && !tokenData.fetching && (
                <div className='my-5'>
                  <p className='text-sm font-light w-11/12'>
                    {tokenInfo?.metadata?.description || metadata?.description}
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
                <img
                    src={'/images/icon.png'}
                    className='w-7 h-7 rounded-full'
                  />
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
                <img
                    src={'/images/icon.png'}
                    className='w-7 h-7 rounded-full'
                  />
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
        </>
    )
}

export default NFTGeneralDetails
