import { constructMediaData, sha256FromBuffer, generateMetadata, isMediaDataVerified, Zora, constructBidShares } from '@zoralabs/zdk'
import { Steps, Button, message, Image } from 'antd';
import { noImage } from '../../helpers/no-image';
import React, {
  useState,
  useEffect,
  useContext
} from "react";
import { GlobalContext } from '../../contexts/provider';
import DocViewer from "react-doc-viewer";
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { Tabs, Row, notification} from 'antd';
import {Img} from 'react-image'
import ReactAudioPlayer from "react-audio-player";
const { TabPane } = Tabs;
import { useEthers, useEtherBalance } from "@usedapp/core";
// import { IpfsClient } from 'provide-js';
// import fileReaderPullStream from 'pull-file-reader';
import ipfs from '../../helpers/ipfs'
import ReactPlayer from 'react-player';
import { Player } from 'video-react';
import { Wallet, ethers, BigNumberish, BigNumber } from 'ethers'
import * as actions from '../../contexts/actions';
import { useRouter } from 'next/router';
// const ipfs = new IpfsClient('http', 'localhost', 5001, '/api/v0/');


// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0/')


const { Step } = Steps;

const steps = [
  {
    title: 'NFT',
    content: 'second',
  },
  {
    title: 'NFT Details',
    content: 'Second-content',
  },
  {
    title: 'Curator Fee',
    content: 'third-content',
  },
  {
    title: 'Preview',
    content: 'Last Content'
  }
];

const tabs = {
  '2': 'Audio',
  '3': 'Video',
  '4': 'Text'
}

const Mint = () => {
  const [current, setCurrent] = useState(0);
  const [fileUrl, setFileUrl] = useState(``)
  const [audioUrl, setAudioUrl] = useState(``)
  const [videoUrl, setVideoUrl] = useState(``)
  const [textUrl, setTextUrl] = useState(``)
  const [buffer, setBuffer] = useState('');
  const [bufferAudio, setBufferAudio] = useState('');
  const [bufferVideo, setBufferVideo] = useState('');
  const [bufferText, setBufferText] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [name, setName] = useState('');
  const [Description, setDescription] = useState('')
  const [feePercantage, setFeePercentage] = useState(0)
  const [ImgLoading, setImgLoading] = useState(false)
  const [AudioLoading, setAudioLoading] = useState(false)
  const [VideoLoading, setVideoLoading] = useState(false)
  const [TextLoading, setTextLoading] = useState(false)
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('')
  const [fileType, setFIleType] = useState('')
  const [contentTab, setContentTab] = useState(null);
  const [Imgupload, setImgUpload] = useState(false) 
  const [Audioupload, setAudioUpload] = useState(false) 
  const [Videoupload, setVideoUpload] = useState(false) 
  const [Textupload, setTextUpload] = useState(false)
  const [proceed, setProceed] = useState(false);
  const [isloggedin, setIsloggedin] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)
  const { activateBrowserWallet, account, chainId, error, deactivate, activate, active, library } = useEthers();
  const [signer, setSigner] = useState({})
  const router = useRouter();
  useEffect( async () => {
    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
        // other stuff using provider here
        console.log(window.ethereum)
    }
  }, []);

  
  console.log(mintLoading)

  async function uploadToDecentralizedStorage(data) {
  const cid = await ipfs.add(data, {
    cidVersion: 1,
    hashAlg: 'sha2-256'
  })
  return `https://ipfs.io/ipfs/${cid[0]?.path}`
  }
  
  const mintZNFT = async (
    content,
    mimeType,
    name,
    Description,
    fileUrl,
    feePercantage,
    setMintLoading
  ) => {
    const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)) 
    // const metadataJSON = generateMetadata('zora-20200101', {
    //   description: Description,
    //   mimeType,
    //   image_url: fileUrl,
    //   name,
    //   version: 'zora-20210604',
    // })

    const metadata = {
      version: 'zora-20211001',
      name: name,
      image_url: fileUrl,
      description: Description,
      mimeType: mimeType, 
    }

    const JsonFormat = JSON.stringify(metadata);
  
    // const contentURI = await uploadToDecentralizedStorage(content);
    const metadataURI = await uploadToDecentralizedStorage(Buffer.from(JsonFormat));

    const mintContent = content !== '' || undefined ? content :  fileUrl;
  
    const contentHash = sha256FromBuffer(mintContent);
    const metadataHash = sha256FromBuffer(Buffer.from(JsonFormat));
    const mediaData = constructMediaData(
      mintContent,
      metadataURI,
      contentHash,
      metadataHash
    );
  
    // // Verifies hashes of content to ensure the hashes match
    // const verified = await isMediaDataVerified(mediaData);
    // console.log('verification', verified)
    // if (!verified){
    //   throw new Error("MediaData not valid, do not mint");
    // }
    
    const creatorPercentage = parseInt(feePercantage);
    setMintLoading(true);
    // // BidShares should sum up to 100%
    const bidShares = constructBidShares(
      parseInt(feePercantage), // creator share percentage
      100 - creatorPercentage, // owner share percentage
      0 // prevOwner share percentage
    );
      zora.mint(mediaData, bidShares)
      .then((tx)=>{
        if(tx){
          setMintLoading(false)
          notification['success']({
            message: `Succefully Minted ${name} NFT`,
            description:
              'it will take upto  a minute for it to be displayed among your NFTs!',
          });
          setTimeout(() => {
            router.push('/list')
          }, 3000);
  
      }
      }).catch((error)=>{
        console.log(error.message)
        notification['error']({
          message: `Failed to Mint ${name} NFT`,
          description:
          error.message.length >= 50 ? 'a token has already been created with this content hash' : error.message,
        });
      });

    
    return new Promise((resolve) => {
      // This listens for the nft transfer event
      zora.media.on(
        "Transfer",
        (from, to, tokenId) => {
        if (
          from === "0x0000000000000000000000000000000000000000" &&
          to === tx.from.address
        ) {
          promise.resolve(tokenId);
        }
      });
    });
  }
  

useEffect(()=>{
  if(Imgupload === true){
    setTimeout(()=>{
      setImgLoading(false)
    }, 10000)
  }
  if(Audioupload === true){
    setTimeout(()=>{
      setAudioLoading(false)
    }, 10000)
  }
  if(Videoupload === true){
    setTimeout(()=>{
      setVideoLoading(false)
    }, 10000)
  }
  if(Textupload === true){
    setTimeout(()=>{
      setTextLoading(false)
    }, 10000)
  }
  if(mintLoading === true){
    setTimeout(()=>{
      setMintLoading(false)
    }, 10000)
  }
}, [Imgupload, Videoupload, Textupload, Audioupload, mintLoading])

const {
  showModalState: {
   showModal,
 },
 setShowModal,
} = useContext(GlobalContext);
const openModal = () => {
  // setIsModalVisible(true);
  actions.changeAuthModal(!showModal)(setShowModal);
};

useEffect(()=>{
  if(account !== null && account !== undefined){
      setIsloggedin(true)
  }
  else{
      setIsloggedin(false)
  }
}, [account, chainId, active])


 const { Dragger } = Upload;

 const uploadAudio = () => {
  if(bufferAudio !== '' && audioUrl === ''){
    ipfs.files.add(bufferAudio, (error, result) => {
      if(error) {
        console.error(error)
      }
      if(result !== undefined){
        setIpfsHash(result[0]?.hash)
        setAudioUrl(`https://ipfs.io/ipfs/${result[0]?.path}`)
        setContentTab('2')
        setContent(audioUrl)

      }
    })
  }
 }

 const uploadVideo = () => {
  if(bufferVideo !== '' && videoUrl === ''){
    ipfs.files.add(bufferVideo, (error, result) => {
      if(error) {
        console.error(error)
      }
      if(result !== undefined){
        setIpfsHash(result[0]?.hash)
        setVideoUrl(`https://ipfs.io/ipfs/${result[0]?.path}`)
        setContentTab('3')
        setContent(videoUrl)
      }
    })
  }
 }

 const uploadText = () => {
  if(bufferText !== '' && textUrl === ''){
    ipfs.files.add(bufferText, (error, result) => {
      if(error) {
        console.error(error)
      }
      if(result !== undefined){
        setIpfsHash(result[0]?.hash)
        setTextUrl(`https://ipfs.io/ipfs/${result[0]?.path}`)
        setContentTab('4')
        setContent(textUrl)
      }
    })
  }
 }


 const uploadImage = () => {
  if(buffer !== '' && fileUrl === ''){
    ipfs.files.add(buffer, (error, result) => {
      if(error) {
        console.error(error)
      }
      if(result !== undefined){
        setIpfsHash(result[0]?.hash)
        setFileUrl(`https://ipfs.io/ipfs/${result[0]?.path}`)
      }
    })
  }
 }

 const propsImage = {
   name: 'file',
   multiple: false,
   action: (Imgupload === true && buffer !== '') ? uploadImage() : '',
  onChange(info) {
    const { status, type } = info.file;
    setFIleType(type)
    if (status !== 'uploading') {
      console.log(info?.file);
    }
    if (status === 'done' && type.split('/')[0].toLowerCase() == 'image') {
      message.success(`${info?.file?.name} file uploaded successfully.`);
    }
  },
  onDrop(e) {
    if(e?.dataTransfer?.files[0]?.type.split('/')[0].toLowerCase() == 'image'){
    setImgUpload(true);
    setImgLoading(true)
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(e?.dataTransfer?.files[0])
    reader.onloadend = () => {
    setBuffer(Buffer(reader.result))
    }
    
  }
  else {
    message.error(`${e?.dataTransfer?.files[0]?.name} is not an Image`);
    setImgUpload(false)
  }
  },
 };

 const propsAudio = {
  name: 'file',
  multiple: false,
  action: Audioupload === true ? uploadAudio() : '',
 onChange(info) {
   const { status, type } = info.file;
   setContentType(type)
   if (status !== 'uploading') {
     console.log(info?.file);
   }
   if (status === 'done' && type.split('/')[0].toLowerCase() == 'audio') {
     message.success(`${info?.file?.name} file uploaded successfully.`);
   }
 },
 onDrop(e) {
   if(e?.dataTransfer?.files[0]?.type.split('/')[0].toLowerCase() == 'audio'){
   setAudioUpload(true);
   setAudioLoading(true)
   const reader = new window.FileReader()
   reader.readAsArrayBuffer(e?.dataTransfer?.files[0])
   reader.onloadend = () => {
   setBufferAudio(Buffer(reader.result))
   }
   
 }
 else {
   message.error(`${e?.dataTransfer?.files[0]?.name} is not an Audio`);
   setAudioUpload(false)
 }
 },
};

const propsText = {
  name: 'file',
  multiple: false,
  action: Textupload === true ?  uploadText() : '',
 onChange(info) {
   const { status, type } = info.file;
   setContentType(type)
   if (status !== 'uploading') {
   }
   if (status === 'done' && type.split('/')[0].toLowerCase() == 'text') {
     message.success(`${info?.file?.name} file uploaded successfully.`);
   }
 },
 onDrop(e) {
   if(e?.dataTransfer?.files[0]?.type.split('/')[0].toLowerCase() == 'text'){
   setTextUpload(true);
   setTextLoading(true)
   const reader = new window.FileReader()
   reader.readAsArrayBuffer(e?.dataTransfer?.files[0])
   reader.onloadend = () => {
   setBufferText(Buffer(reader.result))
   }
   
 }
 else {
   message.error(`${e?.dataTransfer?.files[0]?.name} is not an Text`);
   setTextUpload(false)
 }
 },
};

const propsVideo = {
  name: 'file',
  multiple: false,
  action: Videoupload === true ? uploadVideo() : '',
 onChange(info) {
   const { status, type } = info.file;
   setContentType(type)
   if (status !== 'uploading') {
     console.log(info?.file);
   }
   if (status === 'done' && type.split('/')[0].toLowerCase() == 'video') {
     message.success(`${info?.file?.name} file uploaded successfully.`);
   }
 },
 onDrop(e) {
   if(e?.dataTransfer?.files[0]?.type.split('/')[0].toLowerCase() == 'video'){
   setVideoUpload(true);
   setVideoLoading(true)
   const reader = new window.FileReader()
   reader.readAsArrayBuffer(e?.dataTransfer?.files[0])
   reader.onloadend = () => {
   setBufferVideo(Buffer(reader.result))
   }
   
 }
 else {
   message.error(`${e?.dataTransfer?.files[0]?.name} is not an Video`);
   setVideoUpload(false)
 }
 },
};


  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <>
    {!isloggedin ? (
      <div className="mt-20 flex flex-col justify-around items-center">
          <p className="text-4xl font-bold text-center my-4 w-1/2">Connect your wallet to Mint an NFT</p>
          <button onClick={openModal} className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}>Connect wallet</button>
          <p className="text-gray-600 my-4 cursor-pointer">How to get a wallet!</p>
      </div>

  ) : (
<div className="mt-20 p-10">
        <div>
           <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      {current === 0 && (

        <Tabs defaultActiveKey="1">
            <TabPane tab="Image" key="1">
                  <Dragger openFileDialogOnClick={false}  {...propsImage}>
                  {!fileUrl && !buffer && ImgLoading === false && Imgupload == false && (
                    <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Drag Image to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                  </p></>
                    )}
                    {fileUrl && buffer && Imgupload && ImgLoading === false && (
                      <>
                    <p className="text-gray-400">Your image preview loading ...</p>
                  <div className="flex flex-row justify-around">
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
                   <div className="flex flex-row justify-around">
                  <img
                  className='text-white w-20 h-20 animate-spin mx-4 text-center z-20 ant-upload-drag-icon '
                  src='/images/spinner.png'
                />
                </div>
                )}
                </Dragger>

            </TabPane>
        <TabPane tab="Audio" disabled={(contentTab !== null && contentTab !== '2') ? true : false} key="2">
        <Dragger openFileDialogOnClick={false} {...propsAudio}>
                  {!audioUrl && !bufferAudio && AudioLoading === false && Audioupload === false && (
                    <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Drag Audio to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                  </p></>
                    )}
                    {audioUrl && bufferAudio && Audioupload && AudioLoading === false && (
                      <>
                    <p className="text-gray-400">Your Audio preview loading ...</p>
                  <div className="flex flex-row justify-around">
                 <ReactAudioPlayer src={audioUrl} controls autoPlay/>
                  </div>
                  </>
                )}
                {AudioLoading && (
                   <div className="flex flex-row justify-around">
                  <img
                  className='text-white w-20 h-20 animate-spin mx-4 text-center z-20 ant-upload-drag-icon '
                  src='/images/spinner.png'
                />
                </div>
                )}
        </Dragger>
        </TabPane>
        <TabPane tab="Video" disabled={(contentTab !== null && contentTab !== '3') ? true : false} key="3">
        <Dragger openFileDialogOnClick={false}  {...propsVideo}>
                  {!videoUrl && !bufferVideo && Videoupload == false && VideoLoading === false && (
                    <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Drag Video to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                  </p></>
                    )}
                    {videoUrl && bufferVideo && Videoupload && VideoLoading === false && (
                      <>
                       <p className="text-gray-400">Your Video preview loading ...</p>
                  <div className="flex flex-row justify-around">
                   <ReactPlayer url={videoUrl} className='h-72 w-full object-cover card-img-top rounded-t-lg'/>
                   {/* <Player
                    playsInline
                    src={videoUrl}
                  /> */}
                  </div>
                  </>
                )}
                {VideoLoading && (
                   <div className="flex flex-row justify-around">
                  <img
                  className='text-white w-20 h-20 animate-spin mx-4 text-center z-20 ant-upload-drag-icon '
                  src='/images/spinner.png'
                />
                </div>
                )}
        </Dragger>
        </TabPane>
        <TabPane tab="Text" disabled={(contentTab !== null && contentTab !== '4') ? true : false} key="4">
        <Dragger openFileDialogOnClick={false} {...propsText}>
                  {!textUrl && !bufferText && Textupload == false && TextLoading === false && (
                    <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Drag Text to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                    band files
                  </p></>
                    )}
                    {textUrl && bufferText && Textupload && TextLoading === false && (
                      <>
                     <p className="text-gray-400">Your Text preview loading ...</p>
                  <div className="flex flex-row justify-around">
                  <DocViewer documents={[{ uri: textUrl }]} />
                  </div>
                  </>
                )}
                {TextLoading && (
                   <div className="flex flex-row justify-around">
                  <img
                  className='text-white w-20 h-20 animate-spin mx-4 text-center z-20 ant-upload-drag-icon '
                  src='/images/spinner.png'
                />
                </div>
                )}
        </Dragger>
        </TabPane>
        </Tabs>

        
      )}

      {current === 1 && (
          <div className="my-2 p-5">
              <p className="text-2xl font-bold">Metadata content</p>
              <div class="w-full max-w-xs my-2">
                <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                    Name
                </label>
                <input value={name} onChange={(e)=>{setName(e.target.value)}} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" />
                </div>
                <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="Description">
                    description
                </label>
                <textarea value={Description} onChange={(e)=>{setDescription(e.target.value)}} class="shadow appearance-none border h-20 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="Description" type="Description" placeholder="Description" />
                </div>
            </div>
          </div>
      )}
   
       {current === 2 && (
          <div className="my-2 p-5">
              <p className="text-2xl font-bold">Curator Fee percentage</p>
              <div class="w-full max-w-xs my-2">
                <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                    Curator Fee percentage
                </label>
                <input minlength="3" className={`"bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none ${feePercantage <= 100 ? 'focus:border-purple-500' : 'focus:border-red-400'} focus:bg-white "`} id="inline-full-name" type="number" value={feePercantage} onChange={(e)=>{setFeePercentage(e.target.value)}} />  
                <p class=" text-gray-700 text-sm" for="name">
                Curator Fee percentage must be below or equal to 100%
                </p>
                </div>
            </div>
          </div>
      )}

      {current === 3 && (
          <div className="my-2 p-5">
              <p className="text-2xl font-bold">Preview NFT</p>
              <div
          className={`my-12 bg-gray-200 w-full p-10 flex flex-col items-center justify-around`}
        >
          {(fileUrl && (!audioUrl && !videoUrl)) && (
            <div className={`my-2`}>
                <Image
                  width='60%'
                  src={fileUrl}
                  fallback={noImage}
                  preview={false}
                />
            </div>
          )}
          {audioUrl && (
              <div
                className={`my-5 flex flex-row justify-between`}
              >
                  <div className='flex flex-col md:flex-row items-center'>
                    {fileUrl && (
                      <img
                      className='rounded-t-lg w-80 h-80 mb-4 md:mr-4'
                      src={fileUrl}
                      fallback={noImage}
                    />
                    )}
                    
                    <ReactAudioPlayer src={audioUrl} controls />
                  </div>
                
              </div>
            )}
          {videoUrl && (
            <div
              className={`my-5 flex flex-row justify-between`}
            >
                <>
                <Player
                    playsInline
                    src={videoUrl}
                  />
                </>
            </div>
          )}
          

        </div>
        <div className="p-2">
             <p className="my-2">Name: {name}</p>
             <p className="my-2">Description: {Description}</p>
          </div>
          </div>
        )}

      <div className="steps-action">
        {current < steps.length - 1 && (
            <button onClick={() =>{ if ((fileUrl !== '' || content) !== '' && feePercantage <= 100){ next()} }} className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/6 mt-2 ${((fileUrl !== '' || content) !== '' && feePercantage <= 100) ? '' : 'bg-gray-600 cursor-not-allowed'}`}>
            Next
            </button>
        )}
        {current === steps.length - 1 && (
          <Button onClick={()=>{
            if(fileUrl !== '' && feePercantage <= 100){
            mintZNFT(
              content,
              contentType !== '' ? contentType : fileType,
              name,
              Description,
              fileUrl, feePercantage,
              setMintLoading)
          }}
        }
            className={` ${((fileUrl !== '' || content !== '') !== '' && feePercantage <= 100) ? '' : 'bg-gray-600 cursor-not-allowed'}`}>
          {!mintLoading ? (
            "Mint NFT"
          ) : (
            <Row justify='center'>
              <img
                className='text-white w-5 h-5 animate-spin mx-4 text-center'
                src='/images/spinner.png'
              />
            </Row>)}
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div> 
        </div>
      
    </div>
)}
    
    </>
  );
};


export default Mint