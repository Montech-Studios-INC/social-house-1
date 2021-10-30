import React, {
    useState,
    useEffect,
    useRef,
    useContext,
    useReducer,
  } from "react";
  import { GlobalContext } from '../../contexts/provider';
  import { NFTPreview } from "@zoralabs/nft-components";
  import { useRouter } from "next/router";
  import Wrapper from "../Wrapper/index";
  import { useZNFT, useNFTMetadata } from "@zoralabs/nft-hooks";
  import { MediaConfiguration } from "@zoralabs/nft-components";
  import {
    FetchStaticData,
    MediaFetchAgent,
    NetworkIDs,
  } from "@zoralabs/nft-hooks";
  import { useNFT } from '@zoralabs/nft-hooks'
  import { formatEther, parseEther } from "@ethersproject/units";
  import Link from 'next/link'
  import {noImage} from '../../helpers/no-image';
  import { FullScreen, useFullScreenHandle } from "react-full-screen";
  import ReactAudioPlayer from 'react-audio-player';
  import moment from "moment";
  import { Row, Col, Progress, Image } from "antd";
  import { useWeb3Context } from 'web3-react'
  import { useEthers, useEtherBalance } from "@usedapp/core";
  import * as actions from '../../contexts/actions';
  import { Zora } from '@zoralabs/zdk'
  import { Wallet, ethers, BigNumberish, BigNumber } from 'ethers'
  import { AuctionHouse, Decimal } from '@zoralabs/zdk'
  import { Button, notification, Space } from 'antd';
import { formatUnits } from "@zoralabs/core/node_modules/@ethersproject/units";


  let tokenInfo;
  
  export const useFetch = (data, dispatch, id, contract) => {
    useEffect(() => {
      dispatch({ type: "FETCHING_TOKEN", fetching: true });

  const fetchAgent = new MediaFetchAgent(
    process.env.NEXT_PUBLIC_NETWORK_ID
  );
   FetchStaticData.fetchZoraIndexerItem(fetchAgent, {
    tokenId: id,
    collectionAddress: contract,
  }).then((token) => {
        tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
        dispatch({ type: "STACK_TOKEN", token });
        dispatch({ type: "FETCHING_TOKEN", fetching: false });
        })
        .catch((err) => {
          console.log(err);
        });
    }, [dispatch, data.page]);
  };
  
  
const PlaceBid = ({id, contract}) => {
    const { activateBrowserWallet, account, chainId, error, deactivate, activate, active, library } = useEthers();
    const etherBalance = useEtherBalance(account);
    const [isloggedin, setIsloggedin] = useState(false)
    const router = useRouter();
    const [amount, setAmount] = useState('')
    const [previousBidAmount, setPreviousBid] = useState(0)
    const [bidPlaced, setBidPlaced] = useState(false)
    const [loading, setLoading] = useState(false)
    const rpcURL = process.env.NEXT_PUBLIC_RPC_URL;
    const [signer, setSigner] = useState({})

    useEffect( async () => {
      if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setSigner(provider.getSigner());
          // other stuff using provider here
      }
    }, []);


    // const provider = new ethers.providers.JsonRpcProvider(rpcURL);
    // let wallet = new Wallet(account)
    // wallet = wallet.connect(library)

     // let privateKey = "0df9a9aad13c712ff0b372e754a6d84b23b64ad60769d463ac4d3ab449cc8e07";
    // let wallet = new ethers.Wallet(account);

    // Connect a wallet to mainnet
    // let provider = ethers.getDefaultProvider();
    // let walletWithProvider = new ethers.Wallet(privateKey, provider);
    
    // const provider = new ethers.providers.Web3Provider(typeof window !== "undefined" ? window.ethereum : '')
    
    const handlePlaceBid = async (e, auctionId, amount, setLoading) => {

      const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)) 
  
      const auctionHouse = new AuctionHouse(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));

      e.preventDefault();
      setLoading(true);
      if(amount >= previousBidAmount){
        if(parseFloat(formatUnits(etherBalance)).toFixed(3) < previousBidAmount){
          notification['error']({
            message: 'Error Placing Bid!',
            description:
              'Not enough funds to perform action!',
          });
          setLoading(false)
        }
        else{
          const auction = await auctionHouse.createBid(auctionId, parseEther(amount.toString()));
          setBidPlaced(true);
          notification['success']({
            message: 'Bid Placed',
            description:
              'Successfully placed a bid!',
          });
          setLoading(false)
        }
      }
      else{
        notification['error']({
          message: 'Error Placing Bid!',
          description:
            'The new bid must be 5% more than the current bid!',
        });
        setLoading(false)
      }

    }


    useEffect(()=>{
        if(account !== null && account !== undefined){
            setIsloggedin(true)
        }
        else{
            setIsloggedin(false)
        }
    }, [account, chainId, active])

    const imgReducer = (state, action) => {
      switch (action.type) {
        case "STACK_TOKEN":
          return { ...state, token: state.token.concat(action.token) };
        case "FETCHING_TOKEN":
          return { ...state, fetching: action.fetching };
        default:
          return state;
      }
    };
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
  
    const pageReducer = (state, action) => {
      switch (action.type) {
        case "ADVANCE_PAGE":
          return { ...state, page: state.page + 1 };
        default:
          return state;
      }
    };


    const [tokenData, imgDispatch] = useReducer(imgReducer, {
        token: [],
      fetching: true,
    });
    const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
    useFetch(pager, imgDispatch, id, contract);
  
    const { data } = useNFT(contract, id)
    const {metadata} = useNFTMetadata(data && data.metadataURI);
    let newBid;
    useEffect(()=>{
      const highestBid = data?.pricing?.reserve?.current.highestBid?.pricing.amount ? parseFloat(parseFloat(formatEther(data?.pricing?.reserve?.current.highestBid?.pricing.amount)).toFixed(3)) : 0;
       newBid = (highestBid * 5) / 100 + highestBid;
      setPreviousBid(newBid)
    }, [tokenData, data])
    useEffect(()=>{
      setAmount(newBid)
    }, [newBid, previousBidAmount])

    const getAuction = async (auctionId) => {
      const zora = new Zora(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)) 
  
      const auctionHouse = new AuctionHouse(signer, parseInt(process.env.NEXT_PUBLIC_NETWORK_ID));
      const auction = await auctionHouse.fetchAuction(auctionId)
    }

    // getAuction(tokenData?.token[0]?.nft?.auctionData?.id);


    // if (tokenData.fetching === false) {
    //     setPreviousBid(parseFloat(formatEther(data?.pricing?.reserve?.current.highestBid?.pricing.amount)).toFixed(3))
    //     console.log(previousBidAmount)
    // }

    return (
        <>
       <div className="flex flex-row bg-gray-500 mt-20 justify-between">
           <div className="bg-gray-300 px-10 py-4 w-1/2">
           <Row justify="center" >
            <div className={`bg-gray-300 mt-10 flex flex-col items-center justify-around`}>
                <Col
                  sm={24}
                  md={24}
                  lg={24}
                  key={`${tokenInfo?.tokenId}/${new Date().getTime() / 1000}`}
                  className=" bg-white mx-4 h-9/12 mb-5 tags rounded-lg  border-2 border-gray-100 w-full  shadow-md hover:shadow-xd cursor-pointer"
                >
                  {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
                    !tokenInfo?.metadata?.body) && (
                    <Image
                        
                        align="center"
                        preview={true}
                        height={300}
                        className="h-72 w-full object-cover card-img-top rounded-t-lg"
                        src={tokenInfo?.image}
                        fallback={noImage}
                      />
                  )}
                  {tokenInfo?.metadata.body &&
                    tokenInfo.metadata?.body?.mimeType.split("/")[0] ===
                      "audio" && (
                        <Image
                        height={300}
                        preview={true}
                        className="h-72 w-full object-cover card-img-top rounded-t-lg"
                        src={tokenInfo.metadata.body.artwork.info.uri}
                        fallback={noImage}                      />
                    )}
                    {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
                        <Image
                        height={300}
                        preview={true}
                        className="h-72 w-full object-cover card-img-top rounded-t-lg"
                        src={tokenInfo?.metadata?.image}
                        fallback={noImage}                      />
                    )}
                <Link href={`/token/${tokenInfo?.tokenContract}/${tokenInfo?.tokenId}`}>
                  <div className="p-4 border border-gray-300 rounded-md tags">
                    <Row align="middle" className="mb-2">
                      <Col span={12} className="font-bold text-sm">
                        {tokenInfo?.metadata?.name && tokenInfo?.metadata?.name}
                        {tokenInfo?.metadata?.body && tokenInfo?.metadata?.body?.title}
                      </Col>
                      <Col span={12} align="right">
                        {tokenInfo?.metadata?.body &&
                          tokenInfo?.metadata?.body?.mimeType?.split("/")[0] ===
                            "audio" && (
                            <div className="flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min">
                              <i class="fas fa-volume-up"></i>
                            </div>
                          )}
                        {(tokenInfo?.metadata?.mimeType?.split("/")[0] ===
                          "image" ||
                          !tokenInfo?.metadata?.body) && (
                          <div className="flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min">
                            <i class="fas fa-image"></i>
                          </div>
                        )}
                        {(!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
                          <div className="flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min">
                            <i class="fas fa-video"></i>
                          </div>
                        ))}
                        
                      </Col>
                    </Row>
                    <Row className="w-full mb-5" align="middle">
                      <Col>
                        <img
                          src="/fpo/favicon.png"
                          className="w-5 h-5 rounded-full"
                        />
                      </Col>
                      <Col className="ml-2">Zora</Col>
                    </Row>
                    <Row
                      className="border-t-2 py-2 border-gray-200"
                      align="middle"
                    >
                    {data?.pricing?.reserve?.status === "Active" &&(
                    <Col span={12}>
                        <span className="block text-gray-500 text-md">Current Bid</span>
                        <span className="font-bold text-md">
                        {data?.pricing?.reserve?.current.highestBid?.pricing.amount ? parseFloat(formatEther(data?.pricing?.reserve?.current.highestBid?.pricing.amount)).toFixed(3) + data?.pricing?.reserve?.current.highestBid?.pricing.currency.symbol : "N/A"}
                        </span>
                      </Col>
                    )}
                          <>
                          <Col span={12} className="transition-all duration-300">
                        <Row>
                          <Col>
                            <span className="text-gray-500 text-sm">
                            In 12d 8hrs 2s{" "}
                            </span>
                          </Col>
                          <Col>
                            <div className="inline-block ml-2 shadow-md animate-ping bg-red-500 w-1 h-1 rounded-full "></div>
                          </Col>
                        </Row>
  
                        <Progress
                          size="small"
                          status="exception"
                          showInfo={false}
                          percent={20}
                        />
                      </Col>
                      </>
                    </Row>
                  </div>
                  </Link>
                </Col>
            </div>
            </Row>
           </div>
           <div className="bg-white px-10 py-4 w-1/2">
                      {!isloggedin && (
                          <div className="mt-20 flex flex-col justify-around items-center">
                              <p className="text-4xl font-bold text-center my-4 w-1/2">Connect your wallet to place a bid</p>
                              <button onClick={openModal} className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-full mt-2`}>Connect wallet</button>
                              <p className="text-gray-600 my-4 cursor-pointer">How to get a wallet!</p>
                          </div>

                      )}
                      {isloggedin && (
                          <div className="mt-20 flex flex-col justify-around items-center">
                              <div className="flex flex-row justify-between">
                                  <p className="text-xl">Place a bid</p>
                                  <p className="mx-4 mt-1">Your balance:  {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH</p>
                              </div>
                              <div className="my-3">
                              <input className={`"bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none ${amount >= previousBidAmount ? 'focus:border-purple-500' : 'focus:border-red-400'} focus:bg-white "`} id="inline-full-name" type="number" value={amount} onChange={(e)=>{setAmount(e.target.value)}} />
                              </div>
                              <p>Your bid must be atleast ${previousBidAmount}</p>
                              <p>The next bid must be atleast 5% of the current bid </p>
                              <button className={`bg-black text-white font-bold rounded px-4 py-2 outline-none w-full mt-2 ${amount < previousBidAmount ? 'bg-gray-600 cursor-not-allowed' : ''}`} onClick={(e)=>{amount >= previousBidAmount && handlePlaceBid(e, tokenData?.token[0]?.nft?.auctionData?.id, amount, setLoading)}}>{!loading ? (
                              "Place a bid"
                            ) : (
                              <Row justify='center'>
                                <img
                                  className='text-white w-5 h-5 animate-spin mx-4 text-center'
                                  src='/images/spinner.png'
                                />
                              </Row>
                            )}</button>
                              <p>You cannot withdraw a bid once submitted</p>
                          </div>
                      )}
           </div>
       </div>
        </>
    );
  };
  
  export default PlaceBid;