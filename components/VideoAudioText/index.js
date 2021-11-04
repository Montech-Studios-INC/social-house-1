import React from 'react'
import { Image, Row, Col, Modal, Tooltip } from "antd";
import { noImage } from "../../helpers/no-image";
import ReactAudioPlayer from "react-audio-player";
import ReactPlayer from "react-player";

function VideoAudioText({tokenData, tokenInfo, data}) {
    return (
        <div
        className={`my-12 bg-gray-200 w-full ${
          tokenData.fetching ? "h-96" : "h-auto"
        } p-10 flex flex-col items-center justify-around`}
      >
        {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
          (!tokenInfo?.metadata?.body && tokenInfo?.metadata?.mimeType?.split("/")[0] !== "audio" && tokenInfo?.metadata?.mimeType?.split("/")[0] !== "video")) && (
          <div className={`my-5 ${tokenData.fetching ? "" : " w-96"}`}>
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
    )
}

export default VideoAudioText
