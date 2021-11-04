import {
  constructMediaData,
  sha256FromBuffer,
  Zora,
  constructBidShares,
} from "@zoralabs/zdk";
import { Steps, Button, message, Image } from "antd";
import { noImage } from "../../helpers/no-image";
import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../contexts/provider";
import { Upload } from "antd";
import { Tabs, Row, notification } from "antd";
import ReactAudioPlayer from "react-audio-player";
const { TabPane } = Tabs;
import { useEthers } from "@usedapp/core";
import ipfs from "../../helpers/ipfs";
import { Player } from "video-react";
import { ethers } from "ethers";
import * as actions from "../../contexts/actions";
import { useRouter } from "next/router";
import ImageDrop from './ImageDrop'
import AudioDrop from './AudioDrop'
import TextDrop from './TextDrop'
import VideoDrop from './VideoDrop';
import NFTForm from './NFTForm';

const { Step } = Steps;

const steps = [
  {
    title: "NFT",
    content: "",
  },
  {
    title: "NFT Details",
    content: "",
  },
  {
    title: "Curator Fee",
    content: "",
  },
  {
    title: "Preview",
    content: "",
  },
];

const tabs = {
  2: "Audio",
  3: "Video",
  4: "Text",
};

const Mint = () => {
  const [current, setCurrent] = useState(0);
  const [fileUrl, setFileUrl] = useState(``);
  const [audioUrl, setAudioUrl] = useState(``);
  const [videoUrl, setVideoUrl] = useState(``);
  const [textUrl, setTextUrl] = useState(``);
  const [buffer, setBuffer] = useState("");
  const [bufferAudio, setBufferAudio] = useState("");
  const [bufferVideo, setBufferVideo] = useState("");
  const [bufferText, setBufferText] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [name, setName] = useState("");
  const [Description, setDescription] = useState("");
  const [feePercantage, setFeePercentage] = useState(0);
  const [ImgLoading, setImgLoading] = useState(false);
  const [AudioLoading, setAudioLoading] = useState(false);
  const [VideoLoading, setVideoLoading] = useState(false);
  const [TextLoading, setTextLoading] = useState(false);
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("");
  const [fileType, setFIleType] = useState("");
  const [contentTab, setContentTab] = useState(null);
  const [Imgupload, setImgUpload] = useState(false);
  const [Audioupload, setAudioUpload] = useState(false);
  const [Videoupload, setVideoUpload] = useState(false);
  const [Textupload, setTextUpload] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [isloggedin, setIsloggedin] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const {
    account,
    chainId,
    active,
  } = useEthers();
  const [signer, setSigner] = useState({});
  const router = useRouter();
  useEffect(async () => {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(provider.getSigner());
      console.log(window.ethereum);
    }
  }, []);

  async function uploadToDecentralizedStorage(data) {
    try{
    const cid = await ipfs.add(data, {
      cidVersion: 1,
      hashAlg: "sha2-256",
    });
    return `https://ipfs.io/ipfs/${cid[0]?.path}`;
  }
  catch(error){
    console.log(error)
  }
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
    const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));

    const metadata = {
      version: "zora-20211001",
      name: name,
      image_url: fileUrl,
      description: Description,
      mimeType: mimeType,
    };

    const JsonFormat = JSON.stringify(metadata);

    try{
    const metadataURI = await uploadToDecentralizedStorage(
      Buffer.from(JsonFormat)
    );
    const mintContent = content !== "" || undefined ? content : fileUrl;
    const contentHash = sha256FromBuffer(mintContent);
    const metadataHash = sha256FromBuffer(Buffer.from(JsonFormat));
    const mediaData = constructMediaData(
      mintContent,
      metadataURI,
      contentHash,
      metadataHash
    );

    const creatorPercentage = parseInt(feePercantage);
    setMintLoading(true);
    const bidShares = constructBidShares(
      parseInt(feePercantage),
      100 - creatorPercentage,
      0
    );
    const tx = await zora.mint(mediaData, bidShares);
    if (tx) {
      setMintLoading(false);
      notification["success"]({
        message: `Succefully Minted ${name} NFT`,
        description:
          "it will take upto  a minute for it to be displayed among your NFTs!",
      });
      setTimeout(() => {
        router.push("/list");
      }, 3000);
    }
    return new Promise((resolve) => {
      zora.media.on("Transfer", (from, to, tokenId) => {
        if (
          from === "0x0000000000000000000000000000000000000000" &&
          to === tx.from.address
        ) {
          promise.resolve(tokenId);
        }
      });
    });
  }
  catch(error){
    console.log(error)
    notification["error"]({
      message: `Failed to Mint ${name} NFT`,
      description: error?.message?.length > 200 ? error?.message?.substring(120, 290) : 'Something went wrong',
    });
    setMintLoading(false)
  }
  };

  useEffect(() => {
    if (Imgupload === true) {
      setTimeout(() => {
        setImgLoading(false);
      }, 10000);
    }
    if (Audioupload === true) {
      setTimeout(() => {
        setAudioLoading(false);
      }, 10000);
    }
    if (Videoupload === true) {
      setTimeout(() => {
        setVideoLoading(false);
      }, 10000);
    }
    if (Textupload === true) {
      setTimeout(() => {
        setTextLoading(false);
      }, 10000);
    }
    if (mintLoading === true) {
      setTimeout(() => {
        setMintLoading(false);
      }, 10000);
    }
  }, [Imgupload, Videoupload, Textupload, Audioupload, mintLoading]);

  const {
    showModalState: { showModal },
    setShowModal,
  } = useContext(GlobalContext);
  const openModal = () => {
    actions.changeAuthModal(!showModal)(setShowModal);
  };

  useEffect(() => {
    if (account !== null && account !== undefined) {
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
    }
  }, [account, chainId, active]);

  const { Dragger } = Upload;

  const uploadAudio = () => {
    if (bufferAudio !== "" && audioUrl === "") {
      ipfs.files.add(bufferAudio, (error, result) => {
        if (error) {
          console.error(error);
        }
        if (result !== undefined) {
          setIpfsHash(result[0]?.hash);
          setAudioUrl(`https://ipfs.io/ipfs/${result[0]?.path}`);
          setContentTab("2");
          setContent(audioUrl);
        }
      });
    }
  };

  const uploadVideo = () => {
    if (bufferVideo !== "" && videoUrl === "") {
      ipfs.files.add(bufferVideo, (error, result) => {
        if (error) {
          console.error(error);
        }
        if (result !== undefined) {
          setIpfsHash(result[0]?.hash);
          setVideoUrl(`https://ipfs.io/ipfs/${result[0]?.path}`);
          setContentTab("3");
          setContent(videoUrl);
        }
      });
    }
  };

  const uploadText = () => {
    if (bufferText !== "" && textUrl === "") {
      ipfs.files.add(bufferText, (error, result) => {
        if (error) {
          console.error(error);
        }
        if (result !== undefined) {
          setIpfsHash(result[0]?.hash);
          setTextUrl(`https://ipfs.io/ipfs/${result[0]?.path}`);
          setContentTab("4");
          setContent(textUrl);
        }
      });
    }
  };

  const uploadImage = () => {
    if (buffer !== "" && fileUrl === "") {
      ipfs.files.add(buffer, (error, result) => {
        if (error) {
          console.error(error);
        }
        if (result !== undefined) {
          setIpfsHash(result[0]?.hash);
          setFileUrl(`https://ipfs.io/ipfs/${result[0]?.path}`);
        }
      });
    }
  };

  const propsImage = {
    name: "file",
    multiple: false,
    action: Imgupload === true && buffer !== "" ? uploadImage() : "",
    onChange(info) {
      const { status, type } = info.file;
      setFIleType(type);
      if (status !== "uploading") {
        console.log(info?.file);
      }
      if (status === "done" && type.split("/")[0].toLowerCase() == "image") {
        message.success(`${info?.file?.name} file uploaded successfully.`);
      }
    },
    onDrop(e) {
      if (
        e?.dataTransfer?.files[0]?.type.split("/")[0].toLowerCase() == "image"
      ) {
        setImgUpload(true);
        setImgLoading(true);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(e?.dataTransfer?.files[0]);
        reader.onloadend = () => {
          setBuffer(Buffer(reader.result));
        };
      } else {
        message.error(`${e?.dataTransfer?.files[0]?.name} is not an Image`);
        setImgUpload(false);
      }
    },
  };

  const propsAudio = {
    name: "file",
    multiple: false,
    action: Audioupload === true ? uploadAudio() : "",
    onChange(info) {
      const { status, type } = info.file;
      setContentType(type);
      if (status !== "uploading") {
        console.log(info?.file);
      }
      if (status === "done" && type.split("/")[0].toLowerCase() == "audio") {
        message.success(`${info?.file?.name} file uploaded successfully.`);
      }
    },
    onDrop(e) {
      if (
        e?.dataTransfer?.files[0]?.type.split("/")[0].toLowerCase() == "audio"
      ) {
        setAudioUpload(true);
        setAudioLoading(true);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(e?.dataTransfer?.files[0]);
        reader.onloadend = () => {
          setBufferAudio(Buffer(reader.result));
        };
      } else {
        message.error(`${e?.dataTransfer?.files[0]?.name} is not an Audio`);
        setAudioUpload(false);
      }
    },
  };

  const propsText = {
    name: "file",
    multiple: false,
    action: Textupload === true ? uploadText() : "",
    onChange(info) {
      const { status, type } = info.file;
      setContentType(type);
      if (status !== "uploading") {
      }
      if (status === "done" && type.split("/")[0].toLowerCase() == "text") {
        message.success(`${info?.file?.name} file uploaded successfully.`);
      }
    },
    onDrop(e) {
      if (
        e?.dataTransfer?.files[0]?.type.split("/")[0].toLowerCase() == "text"
      ) {
        setTextUpload(true);
        setTextLoading(true);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(e?.dataTransfer?.files[0]);
        reader.onloadend = () => {
          setBufferText(Buffer(reader.result));
        };
      } else {
        message.error(`${e?.dataTransfer?.files[0]?.name} is not an Text`);
        setTextUpload(false);
      }
    },
  };

  const propsVideo = {
    name: "file",
    multiple: false,
    action: Videoupload === true ? uploadVideo() : "",
    onChange(info) {
      const { status, type } = info.file;
      setContentType(type);
      if (status !== "uploading") {
        console.log(info?.file);
      }
      if (status === "done" && type.split("/")[0].toLowerCase() == "video") {
        message.success(`${info?.file?.name} file uploaded successfully.`);
      }
    },
    onDrop(e) {
      if (
        e?.dataTransfer?.files[0]?.type.split("/")[0].toLowerCase() == "video"
      ) {
        setVideoUpload(true);
        setVideoLoading(true);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(e?.dataTransfer?.files[0]);
        reader.onloadend = () => {
          setBufferVideo(Buffer(reader.result));
        };
      } else {
        message.error(`${e?.dataTransfer?.files[0]?.name} is not an Video`);
        setVideoUpload(false);
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
        <div className='mt-20 flex flex-col justify-around items-center'>
          <p className='text-4xl font-bold text-center my-4 w-1/2'>
            Connect your wallet to Mint an NFT
          </p>
          <button
            onClick={openModal}
            className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-1/3 mt-2`}
          >
            Connect wallet
          </button>
          <p className='text-gray-600 my-4 cursor-pointer'>
            How to get a wallet!
          </p>
        </div>
      ) : (
        <div className='pt-28 p-10 w-12/13 md:w-1/2 m-auto'>
          <Steps current={current} size='small'>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div className='w-10/12 m-auto mt-9 text-center'>
            {current === 0 && (
              <Tabs defaultActiveKey='1' centered>
                <TabPane tab='Image' key='1'>
                  <Dragger openFileDialogOnClick={false} {...propsImage}>
                    <ImageDrop fileUrl={fileUrl} buffer={buffer} ImgLoading={ImgLoading} Imgupload={Imgupload}/>
                  </Dragger>
                </TabPane>
                <TabPane
                  tab='Audio'
                  disabled={
                    contentTab !== null && contentTab !== "2" ? true : false
                  }
                  key='2'
                >
                  <Dragger openFileDialogOnClick={false} {...propsAudio}>
                    <AudioDrop audioUrl={audioUrl} bufferAudio={bufferAudio} AudioLoading={AudioLoading} Audioupload={Audioupload} />
                  </Dragger>
                </TabPane>
                <TabPane
                  tab='Video'
                  disabled={
                    contentTab !== null && contentTab !== "3" ? true : false
                  }
                  key='3'
                >
                  <Dragger openFileDialogOnClick={false} {...propsVideo}>
                   <VideoDrop videoUrl={videoUrl} bufferVideo={bufferVideo} VideoLoading={VideoLoading} Videoupload={Videoupload} />
                  </Dragger>
                </TabPane>
                <TabPane
                  tab='Text'
                  disabled={
                    contentTab !== null && contentTab !== "4" ? true : false
                  }
                  key='4'
                >
                  <Dragger openFileDialogOnClick={false} {...propsText}>
                    <TextDrop textUrl={textUrl} bufferText={bufferText} TextLoading={TextLoading} Textupload={Textupload} />
                  </Dragger>
                </TabPane>
              </Tabs>
            )}

            {current === 1 && (
              <NFTForm name={name} setName={setName} Description={Description} setDescription={setDescription} />
            )}

            {current === 2 && (
              <div className='my-2 p-5 flex items-center content-center flex-col'>
                <p className='text-2xl font-bold mb-5'>
                  Curator Fee percentage
                </p>
                <div class='w-12/13 md:w-1/2 my-2'>
                  <div class='mb-4'>
                    <label
                      class='block text-gray-700 text-sm font-bold mb-5'
                      for='name'
                    >
                      Curator Fee percentage
                    </label>
                    <input
                      minlength='3'
                      className={`"bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none ${
                        feePercantage <= 100
                          ? "focus:border-purple-500"
                          : "focus:border-red-400"
                      } focus:bg-white"`}
                      id='inline-full-name'
                      type='number'
                      value={feePercantage}
                      onChange={(e) => {
                        setFeePercentage(e.target.value);
                      }}
                    />
                    <p class=' text-gray-700 text-sm mt-5' for='name'>
                      Curator Fee percentage must be below or equal to 100%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {current === 3 && (
              <div className='my-2 p-5'>
                <p className='text-2xl font-bold'>Preview NFT</p>
                <div
                  className={`my-12 bg-gray-200 w-full p-10 flex flex-col items-center justify-around`}
                >
                  {fileUrl && !audioUrl && !videoUrl && (
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
                    <div className={`my-5 flex flex-row justify-between`}>
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
                    <div className={`my-5 flex flex-row justify-between`}>
                      <>
                        <Player playsInline src={videoUrl} />
                      </>
                    </div>
                  )}
                </div>
                <div className='p-2'>
                  <p className='my-2'>Name: {name}</p>
                  <p className='my-2'>Description: {Description}</p>
                </div>
              </div>
            )}

            <div className='steps-action'>
              {current < steps.length - 1 && (
                <button
                  onClick={() => {
                    if (
                      (fileUrl !== "" || content) !== "" &&
                      feePercantage <= 100
                    ) {
                      next();
                    }
                  }}
                  className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-max mt-8 ${
                    (fileUrl !== "" || content) !== "" && feePercantage <= 100
                      ? ""
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              )}
              {current === steps.length - 1 && (
                <Button
                  onClick={() => {
                    if (fileUrl !== "" && feePercantage <= 100) {
                      mintZNFT(
                        content,
                        contentType !== "" ? contentType : fileType,
                        name,
                        Description,
                        fileUrl,
                        feePercantage,
                        setMintLoading
                      );
                    }
                  }}
                  className={` ${
                    (fileUrl !== "" || content !== "") !== "" &&
                    feePercantage <= 100
                      ? ""
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  {!mintLoading ? (
                    "Mint NFT"
                  ) : (
                    <Row justify='center'>
                      <img
                        className='text-white w-5 h-5 animate-spin mx-4 text-center'
                        src='/images/spinner.png'
                      />
                    </Row>
                  )}
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
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

export default Mint;
