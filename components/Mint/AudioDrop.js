import React from 'react'
import ReactAudioPlayer from "react-audio-player";
import { InboxOutlined } from "@ant-design/icons";


function AudioDrop({ audioUrl, bufferAudio, AudioLoading, Audioupload}) {
    return (
        <>
          {!audioUrl &&
                      !bufferAudio &&
                      AudioLoading === false &&
                      Audioupload === false && (
                        <>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined />
                          </p>
                          <p className='ant-upload-text'>
                            Drag Audio to this area to upload
                          </p>
                          <p className='ant-upload-hint'>
                            Support for a single or bulk upload. Strictly
                            prohibit from uploading company data or other band
                            files
                          </p>
                        </>
                      )}
                    {audioUrl &&
                      bufferAudio &&
                      Audioupload &&
                      AudioLoading === false && (
                        <>
                          <p className='text-gray-400'>
                            Your Audio preview loading ...
                          </p>
                          <div className='flex flex-row justify-around'>
                            <ReactAudioPlayer
                              src={audioUrl}
                              controls
                              autoPlay
                            />
                          </div>
                        </>
                      )}
                    {AudioLoading && (
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

export default AudioDrop
