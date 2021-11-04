import React from 'react'
import { InboxOutlined } from "@ant-design/icons";
import DocViewer from "react-doc-viewer";

function TextDrop({ textUrl, bufferText, TextLoading, Textupload}) {
    return (
        <>
          {!textUrl &&
                      !bufferText &&
                      Textupload == false &&
                      TextLoading === false && (
                        <>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined />
                          </p>
                          <p className='ant-upload-text'>
                            Drag Text to this area to upload
                          </p>
                          <p className='ant-upload-hint'>
                            Support for a single or bulk upload. Strictly
                            prohibit from uploading company data or other band
                            files
                          </p>
                        </>
                      )}
                    {textUrl &&
                      bufferText &&
                      Textupload &&
                      TextLoading === false && (
                        <>
                          <p className='text-gray-400'>
                            Your Text preview loading ...
                          </p>
                          <div className='flex flex-row justify-around'>
                            <DocViewer documents={[{ uri: textUrl }]} />
                          </div>
                        </>
                      )}
                    {TextLoading && (
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

export default TextDrop
