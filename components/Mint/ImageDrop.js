import React from 'react'
import { Image } from "antd";
import { noImage } from "../../helpers/no-image";
import { InboxOutlined } from "@ant-design/icons";


function ImageDrop({ fileUrl, buffer, ImgLoading, Imgupload}) {
    return (
        <>
          {!fileUrl &&
                      !buffer &&
                      ImgLoading === false &&
                      Imgupload == false && (
                        <>
                          <p className='ant-upload-drag-icon'>
                            <InboxOutlined />
                          </p>
                          <p className='ant-upload-text'>
                            Drag Image to this area to upload
                          </p>
                          <p className='ant-upload-hint'>
                            Support for a single or bulk upload. Strictly
                            prohibit from uploading company data or other band
                            files
                          </p>
                        </>
                      )}
                    {fileUrl && buffer && Imgupload && ImgLoading === false && (
                      <>
                        <p className='text-gray-400 my-2'>
                          Your image preview loading ...
                        </p>
                        <div className='flex flex-row justify-around'>
                          <Image
                            width='20%'
                            src={fileUrl}
                            fallback={noImage}
                            preview={false}
                          />
                        </div>
                      </>
                    )}
                    {ImgLoading && (
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

export default ImageDrop
