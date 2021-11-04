import React, {useState,useEffect,useContext,useReducer,} from "react";
import { GlobalContext } from "../../contexts/provider";
import { useRouter } from "next/router";
import { useNFTMetadata } from "@zoralabs/nft-hooks";
import { FetchStaticData, MediaFetchAgent } from "@zoralabs/nft-hooks";
import { useNFT } from "@zoralabs/nft-hooks";
import { formatEther, parseEther } from "@ethersproject/units";
import Link from "next/link";
import { noImage } from "../../helpers/no-image";
import moment from "moment";
import { Row, Col, Image } from "antd";
import { useEthers, useEtherBalance } from "@usedapp/core";
import * as actions from "../../contexts/actions";
import { Zora } from "@zoralabs/zdk";
import {ethers } from "ethers";
import { AuctionHouse } from "@zoralabs/zdk";
import { notification } from "antd";
import { formatUnits } from "@zoralabs/core/node_modules/@ethersproject/units";
import { Divider } from "antd";
import Countdown from 'react-countdown'
import { Typography } from "@mui/material";
import {pageReducer, imgReducer} from '../../helpers/reducers'

let tokenInfo;

export const useFetch = (data, dispatch, id, contract) => {
  useEffect(() => {
    dispatch({ type: "FETCHING_TOKEN", fetching: true });

    const fetchAgent = new MediaFetchAgent(process.env.NEXT_PUBLIC_NETWORK_ID);
    FetchStaticData.fetchZoraIndexerItem(fetchAgent, {
      tokenId: id,
      collectionAddress: contract,
    })
      .then((token) => {
        tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
        dispatch({ type: "STACK_TOKEN", token });
        dispatch({ type: "FETCHING_TOKEN", fetching: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, data.page]);
};

const PlaceBid = ({ id, contract }) => {
  const { activateBrowserWallet,account,chainId,active} = useEthers();
  const etherBalance = useEtherBalance(account);
  const [isloggedin, setIsloggedin] = useState(false);
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [previousBidAmount, setPreviousBid] = useState(0);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState({});

  useEffect(async () => {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(provider.getSigner());
    }
  }, []);

  const handleCountDown = (startTime, currentTime, endTime) => {
    const diff = Math.abs(startTime - endTime);
    const time_used = Math.abs(startTime - currentTime);
    const percentage = (time_used * 100) / diff;
    console.log(percentage)
  };

  const [percent, setPercent] = useState("100%");

  async function  handlePlaceBid (
    e,
    auctionId,
    amount,
    setLoading
  ){
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
          auctionHouse.createBid(auctionId, parseEther(amount.toString())).then((auction)=>{
            setBidPlaced(true);
          notification['success']({
            message: 'Bid Placed',
            description:
              'Successfully placed a bid!',
          });
          setLoading(false)
          router.push(`/token/${contract}/${id}`)
          }).catch(error => {
            console.log(error)
            notification['error']({
              message: 'Error placing bid!',
              description:
                error.message.substring(115, 160),
            });
            setLoading(false)
          });
        }
      }
      else{
        notification['error']({
          message: 'Error Placing Bid!',
          description:
            'The new bid must be 5% more than the current bid!',
        });
        setLoading(false);
      }
    }

  useEffect(() => {
    if (account !== null && account !== undefined) {
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
    }
  }, [account, chainId, active]);
  const {
    showModalState: { showModal },
    setShowModal,
  } = useContext(GlobalContext);
  const openModal = () => {
    actions.changeAuthModal(!showModal)(setShowModal);
  };


  const [tokenData, imgDispatch] = useReducer(imgReducer, {
    token: [],
    fetching: true,
  });
  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
  useFetch(pager, imgDispatch, id, contract);

  const { data } = useNFT(contract, id);
  let newBid;
  useEffect(() => {
    const highestBid = data?.pricing?.reserve?.current.highestBid?.pricing
      .amount
      ? parseFloat(
          parseFloat(
            formatEther(
              data?.pricing?.reserve?.current.highestBid?.pricing.amount
            )
          ).toFixed(3)
        )
      : 0;
    newBid = (highestBid * 5) / 100 + highestBid;
    setPreviousBid(newBid <= 0 ? parseInt(data?.pricing?.reserve?.reservePrice.prettyAmount) || 0.001 : newBid);
  }, [tokenData, data]);
  useEffect(() => {
    setAmount(newBid);
  }, [newBid, previousBidAmount]);

  useEffect(() => {
    handleCountDown(parseInt(data?.pricing?.reserve?.approvedTimestamp), Date.now() / 1000, parseInt(data?.pricing?.reserve?.expectedEndTimestamp));
  }, []);

  return (
    <>
      <div className='flex flex-col md:flex-row pt-20 h-screen'>
        <div className='bg-gray-100 flex items-center justify-center w-full md:w-1/2'>
          <Row justify='center' className='w-12/13 mt-5 md:mt-0 md:w-1/2'>
            <Col
              sm={24}
              md={24}
              lg={24}
              key={`${tokenInfo?.tokenId}/${new Date().getTime() / 1000}`}
              className=' bg-white mx-4 h-9/12 mb-5 tags rounded-lg  border-2 border-gray-100 w-full  shadow-md hover:shadow-xd cursor-pointer'
            >
              {(tokenInfo?.metadata?.mimeType?.split("/")[0] === "image" ||
                !tokenInfo?.metadata?.body) && (
                <Image
                  align='center'
                  preview={false}
                  className='h-auto w-full object-cover card-img-top rounded-t-lg'
                  src={tokenInfo?.image}
                  fallback={noImage}
                  style={{ minHeight: 300 }}
                />
              )}
              {tokenInfo?.metadata?.body &&
                tokenInfo?.metadata?.body?.mimeType.split("/")[0] ===
                  "audio" && (
                  <Image
                    preview={false}
                    className='h-auto w-full object-cover card-img-top rounded-t-lg'
                    src={tokenInfo.metadata.body.artwork.info.uri}
                    fallback={noImage}
                    style={{ minHeight: 300 }}
                  />
                )}
              {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
                <Image
                  preview={false}
                  className='h-auto w-full object-cover card-img-top rounded-t-lg'
                  src={tokenInfo?.metadata?.image}
                  fallback={noImage}
                  style={{ minHeight: 300 }}
                />
              )}
              <Link
                href={`/token/${tokenInfo?.tokenContract}/${tokenInfo?.tokenId}`}
              >
                <div className='p-4 border border-gray-300 rounded-md'>
                  <Row align='middle' className='mb-2'>
                    <Col span={12} className='font-bold text-sm'>
                      {tokenInfo?.metadata?.name && tokenInfo?.metadata?.name}
                      {tokenInfo?.metadata?.body &&
                        tokenInfo?.metadata?.body?.title}
                    </Col>
                    <Col span={12} align='right'>
                      {tokenInfo?.metadata?.body &&
                        tokenInfo?.metadata?.body?.mimeType?.split("/")[0] ===
                          "audio" && (
                          <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                            <i class='fas fa-volume-up'></i>
                          </div>
                        )}
                      {(tokenInfo?.metadata?.mimeType?.split("/")[0] ===
                        "image" ||
                        !tokenInfo?.metadata?.body) && (
                        <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                          <i class='fas fa-image'></i>
                        </div>
                      )}
                      {!tokenInfo?.metadata?.body &&
                        tokenInfo?.metadata?.image && (
                          <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                            <i class='fas fa-video'></i>
                          </div>
                        )}
                    </Col>
                  </Row>
                  <Row className='w-full mb-5' align='middle'>
                    <Col>
                      <img
                        src='/fpo/favicon.png'
                        className='w-5 h-5 rounded-full'
                      />
                    </Col>
                    <Col className='ml-2'>Zora</Col>
                  </Row>
                  <Row
                    className='border-t-2 py-2 border-gray-200'
                    align='middle'
                  >
                    {data?.pricing?.reserve?.status === "Active" && (
                      <Col span={12}>
                        <span className='block text-gray-500 text-md'>
                          Current Bid
                        </span>
                        <span className='font-bold text-md'>
                          {data?.pricing?.reserve?.current.highestBid?.pricing
                            .amount
                            ? parseFloat(
                                formatEther(
                                  data?.pricing?.reserve?.current.highestBid
                                    ?.pricing.amount
                                )
                              ).toFixed(3) +
                              data?.pricing?.reserve?.current.highestBid
                                ?.pricing?.currency.symbol
                            : "No Current bid"}
                        </span>
                      </Col>
                    )}
                    <>
                      <Col span={12} className='transition-all duration-300'>
                      <Col>
                          <span className='text-gray-500 text-sm'>
                           Ends In
                          </span>
                        </Col>
                        <Row>
                          <Col>
                            <span className='text-gray-800 font-bold text-sm'>
                            <Countdown date={moment.unix(data?.pricing?.reserve?.expectedEndTimestamp).format()} />
                            </span>
                          </Col>
                          <Col>
                            <div className='inline-block ml-2 shadow-md animate-ping bg-red-500 w-1 h-1 rounded-full '></div>
                          </Col>
                        </Row>

                        {/* <Progress
                          size='small'
                          status='exception'
                          showInfo={false}
                          percent={20}
                        /> */}
                      </Col>
                    </>
                  </Row>
                </div>
              </Link>
            </Col>
          </Row>
        </div>
        <div className='flex flex-col items-center justify-center w-full md:w-1/2'>
          {!isloggedin && (
            <div className=' w-9/12 pt-4 md:pt-0 md:w-1/2 m-auto text-center'>
              <p className='text-4xl font-bold mb-8'>
                Connect your wallet to place a bid
              </p>
              <Divider>SELECT WALLET</Divider>
              <button
                onClick={openModal}
                className={`bg-black text-white font-bold rounded px-4 py-4 outline-none mt-5 w-1/2`}
              >
                Connect wallet
              </button>
              <p className='text-gray-600 my-4 font-bold cursor-pointer'>
                How to get a wallet!
              </p>
            </div>
          )}
          {isloggedin && (
            <div className='w-9/12 pt-4 md:pt-0 md:w-1/2 m-auto text-center'>
              <p className='text-4xl font-bold mb-8'>Place a bid</p>
              <p className='text-gray-400'>
                Your balance:{" "}
                {etherBalance &&
                  parseFloat(formatEther(etherBalance)).toFixed(3)}{" "}
                ETH
              </p>
              <div className='my-3'>
                <input
                  className={`"bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full md:w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none ${
                    amount >= previousBidAmount
                      ? "focus:border-purple-500"
                      : "focus:border-red-400"
                  } focus:bg-white "`}
                  id='inline-full-name'
                  type='number'
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                />
              </div>
              <p>Your bid must be atleast  {previousBidAmount} ETH</p>
              <p>The next bid must be atleast 5% of the current bid </p>
              <p>The Reserve price is {data?.pricing?.reserve.reservePrice.prettyAmount} {data?.pricing?.reserve.reservePrice.currency.symbol}</p>

              <button
                className={`bg-black text-white font-bold rounded px-4 py-4 outline-none w-full mt-6 ${
                  amount < previousBidAmount
                    ? "bg-gray-600 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  amount >= previousBidAmount &&
                    handlePlaceBid(
                      e,
                      tokenData?.token[0]?.nft?.auctionData?.id,
                      amount,
                      setLoading
                    );
                }}
              >
                {!loading ? (
                  "Place a bid"
                ) : (
                  <Row justify='center'>
                    <img
                      className='text-white w-5 h-5 animate-spin mx-4 text-center'
                      src='/images/spinner.png'
                    />
                  </Row>
                )}
              </button>
              <p className="my-2">You cannot withdraw a bid once submitted</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaceBid;
