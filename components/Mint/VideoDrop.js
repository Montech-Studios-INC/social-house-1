import React from 'react'
import { InboxOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";

function VideoDrop({ videoUrl, bufferVideo, VideoLoading, Videoupload}) {
    return (
        <>
          {!videoUrl &&
                      !bufferVideo &&
                      Videoupload == false &&
                      VideoLoading === false && (
                        <>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined />
                          </p>
                          <p className='ant-upload-text'>
                            Drag Video to this area to upload
                          </p>
                          <p className='ant-upload-hint'>
                            Support for a single or bulk upload. Strictly
                            prohibit from uploading company data or other band
                            files
                          </p>
                        </>
                      )}
                    {videoUrl &&
                      bufferVideo &&
                      Videoupload &&
                      VideoLoading === false && (
                        <>
                          <p className='text-gray-400'>
                            Your Video preview loading ...
                          </p>
                          <div className='flex flex-row justify-around'>
                            <ReactPlayer
                              url={videoUrl}
                              className='h-72 w-full object-cover card-img-top rounded-t-lg'
                            />
                          </div>
                        </>
                      )}
                    {VideoLoading && (
                      <div className='flex flex-row justify-around'>
                        <img
                          className='text-white w-20 h-20 animate-spin mx-4 text-center z-20 ant-upload-drag-icon '
                          src='/images/spinner.png'
                        />
                      </div>
                    )}  
        </>
    )
}

export default VideoDrop
