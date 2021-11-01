import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
} from "react";
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
import { slice, concat } from "lodash";
import { Row, Col, Progress, Image } from "antd";
import shortenNum from "short-number";
import { useNFT } from "@zoralabs/nft-hooks";
import { formatEther } from "@ethersproject/units";
import Link from "next/link";
import { noImage } from "../../helpers/no-image";
import ReactPlayer from 'react-player'
import Countdown from 'react-countdown'
import moment from "moment";

const array = [1, 2, 3, 4, 5, 6, 7, 8];

export const useFetch = (data, dispatch, limit) => {
  useEffect(() => {
    dispatch({ type: "FETCHING_TOKENS", fetching: true });
    const fetchAgent = new MediaFetchAgent(process.env.NEXT_PUBLIC_NETWORK_ID);
    FetchStaticData.fetchZoraIndexerList(fetchAgent, {
      curatorAddress: process.env.NEXT_PUBLIC_CURATORS_ID,
      collectionAddress: process.env.NEXT_PUBLIC_TARGET_CONTRACT_ADDRESS,
      limit: limit,
      offset: 0,
    })
      .then((tokens) => {
        dispatch({ type: "STACK_TOKENS", tokens });
        dispatch({ type: "FETCHING_TOKENS", fetching: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, data.page]);
};

// infinite scrolling with intersection observer
export const useInfiniteScroll = (scrollRef, dispatch) => {
  const scrollObserver = useCallback(
    (node) => {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.intersectionRatio > 0) {
            dispatch({ type: "ADVANCE_PAGE" });
            // setLimit(limit + 9)
          }
        });
      }).observe(node);
    },
    [dispatch]
  );
  useEffect(() => {
    if (scrollRef.current) {
      scrollObserver(scrollRef.current);
    }
    // loadMore();
  }, [scrollObserver, scrollRef]);
};

// lazy load TOKENS with intersection observer
export const useLazyLoading = (imgSelector, items) => {
  const imgObserver = useCallback((node) => {
    const intObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.intersectionRatio > 0) {
          const currentImg = en.target;
          const newImgSrc = currentImg.dataset.src;

          // only swap out the image source if the new url exists
          if (!newImgSrc) {
            console.error("Image source is invalid");
          } else {
            currentImg.src = newImgSrc;
          }
          intObs.unobserve(node);
        }
      });
    });
    intObs.observe(node);
  }, []);

  const tokensRef = useRef(null);

  useEffect(() => {
    tokensRef.current = document.querySelectorAll(imgSelector);

    if (tokensRef.current) {
      tokensRef.current.forEach((img) => imgObserver(img));
    }
  }, [imgObserver, tokensRef, imgSelector, items]);
};

export const AuctionsList = () => {
  const router = useRouter();

  const imgReducer = (state, action) => {
    switch (action.type) {
      case "STACK_TOKENS":
        return { ...state, tokens: state.tokens.concat(action.tokens) };
      case "FETCHING_TOKENS":
        return { ...state, fetching: action.fetching };
      default:
        return state;
    }
  };

  const pageReducer = (state, action) => {
    switch (action.type) {
      case "ADVANCE_PAGE":
        return { ...state, page: state.page + 1 };
      default:
        return state;
    }
  };

  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 });
  const [tokenData, imgDispatch] = useReducer(imgReducer, {
    tokens: [],
    fetching: true,
  });
  const [limit, setLimit] = useState(100);
  const [index, setIndex] = useState(8);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [bidButtonStyle, setBidButtonStyle] = useState({ display: "none" });
  const [bidTime, setBidTimeStyle] = useState({ display: "block" });

  useEffect(() => {
    if (index < tokenData.tokens.length - 1) {
      setShowMore(true);
    }
    if (showMore) {
      setList(slice(tokenData.tokens, 0, index));
      console.log(list);
    }
  }, [tokenData, tokenData.fetching]);
  const loadMore = () => {
    const newIndex = index + 8;
    const newShowMore = newIndex < tokenData.tokens.length - 1;
    let newList;
    if (newShowMore === true) {
      newList = concat(list, slice(tokenData.tokens, index, newIndex));
      setList(newList);
    }
    setIndex(newIndex);
    setShowMore(newShowMore);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getNFT = async () => {
    const { data, error } = await useNFT(
      "0xe8e1b3125372e4912773357691AeB7C305584751",
      "1"
    );
    return data;
  };

  let bottomBoundaryRef = useRef(null);
  useFetch(pager, imgDispatch, limit);
  useLazyLoading(".card-img-top", tokenData.tokens);
  useInfiniteScroll(bottomBoundaryRef, pagerDispatch);

  // console.log('sliced', ListSplicer)

  // const {metadata} = useNFTMetadata(data && data.metadataURI);
  // const { data, error } = useNFT('0xe8e1b3125372e4912773357691AeB7C305584751', '1')
  // console.log('acution', data)
  return (
    <Wrapper>
      <div
        className='overflow-y-auto flex flex-wrap'
        style={{ height: "82vh" }}
      >
        {tokenData.tokens.length !== 0 &&
          tokenData.fetching === false &&
          loading === false &&
          list.map((token) => {
            const tokenInfo = FetchStaticData.getIndexerServerTokenInfo(token);
            console.log("token info", tokenInfo);
            return (
              <div className=" w-full sm:w-full md:w-1/2 lg:w-1/4">
              <div
                key={`${tokenInfo.tokenId}`}
                className=' bg-white mb-5 rounded-lg  border-2 border-gray-100 shadow-md hover:shadow-xd cursor-pointer w-full sm:w-full md:w-11/12'
              >
                {(tokenInfo.metadata?.mimeType?.split("/")[0] === "image" ||
                  !tokenInfo?.metadata?.body) && (
                  <Image
                    align='center'
                    preview={false}
                    height={300}
                    width="100%"
                    className='h-72 w-full object-cover card-img-top rounded-t-lg'
                    src={tokenInfo.image}
                    fallback={noImage}
                  />
                )}
                {(tokenInfo.metadata?.mimeType?.split("/")[0] === "video" &&
                  !tokenInfo?.metadata?.body) && (
                  // <Image
                  //   align='center'
                  //   preview={false}
                  //   height={300}
                  //   width="100%"
                  //   className='h-72 w-full object-cover card-img-top rounded-t-lg'
                  //   src={tokenInfo.image}
                  //   fallback={noImage}
                  // />
                  <ReactPlayer url={tokenInfo?.image} playing loop className='h-72 w-full object-cover card-img-top rounded-t-lg'/>
                )}
                  {tokenInfo.metadata.body &&
                    tokenInfo.metadata?.body?.mimeType.split("/")[0] ===
                      "audio" && (
                      <Image
                        height={300}
                        width='100%'
                        preview={false}
                        className='h-72 w-full object-cover card-img-top rounded-t-lg'
                        src={tokenInfo.metadata.body.artwork.info.uri}
                        fallback={noImage}
                      />
                    )}
                  {!tokenInfo.metadata.body && tokenInfo.metadata.image && (
                    <Image
                      height={300}
                      width='100%'
                      preview={false}
                      className='h-72 w-full object-cover card-img-top rounded-t-lg'
                      src={tokenInfo.metadata.image}
                      fallback={noImage}
                    />
                  )}
                {!tokenInfo?.metadata?.body && tokenInfo?.metadata?.image && (
                  <Image
                    height={300}
                    width="100%"
                    preview={false}
                    className='h-72 w-full object-cover card-img-top rounded-t-lg'
                    src={tokenInfo.metadata.image}
                    fallback={noImage}
                  />
                )}
                <Link
                  href={`/token/${tokenInfo?.tokenContract}/${tokenInfo?.tokenId}`}
                >
                  <div className='p-4'>
                    <Row align='middle' className='mb-2'>
                      <Col span={12} className='font-bold text-sm'>
                      {tokenInfo.metadata?.name && tokenInfo.metadata?.name}
                        {tokenInfo.metadata?.body && tokenInfo.metadata?.body?.title}
                      </Col>
                      <Col span={12} align='right'>
                        {tokenInfo.metadata?.body &&
                          tokenInfo.metadata?.body?.mimeType?.split("/")[0] ===
                            "audio" && (
                            <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                              <i class="fas fa-volume-up"></i>
                            </div>
                          )}
                        {(tokenInfo.metadata?.mimeType?.split("/")[0] ===
                          "image" ||
                          !tokenInfo.metadata?.body) && (
                          <div className='flex items-center justify-center bg-black rounded-full p-2 text-white font-bold w-min'>
                            <i class='fas fa-image'></i>
                          </div>
                        )}
                      {(tokenInfo.metadata?.mimeType?.split("/")[0] === "video" && !tokenInfo?.metadata?.body) && (
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
                        {token.nft?.auctionData?.status === "Active" && (
                          <Col span={12}>
                            <span className='block text-gray-500 text-md'>
                              Current Bid
                            </span>
                            <span className='font-bold text-md'>
                              {token?.nft?.auctionData?.currentBid
                                ? parseFloat(
                                    formatEther(
                                      token?.nft?.auctionData?.currentBid
                                        ?.amount
                                    )
                                  ).toFixed(3) + " ETH"
                                : "N/A"}
                            </span>
                          </Col>
                        )}

                        {token.nft?.auctionData?.status === "Finished" && (
                          <Col span={12}>
                            <span className='block text-gray-500 text-md'>
                              Sold at
                            </span>
                            <span className='font-bold text-md'>
                              {token?.nft?.tokenData?.auctions[0].lastBidAmount
                                ? parseFloat(
                                    formatEther(
                                      token?.nft?.tokenData?.auctions[0]
                                        .lastBidAmount
                                    )
                                  ).toFixed(3) + " ETH"
                                : "N/A"}
                            </span>
                          </Col>
                        )}

                      {token?.nft?.auctionData?.status === "Active" ? (
                        <>
                          <Col
                            span={12}
                            className='transition-all duration-300'
                          >
                            <Row>
                              <Col>
                                <span className='text-gray-500 text-sm'>
                                {moment.unix(token?.nft?.auctionData.expectedEndTimestamp).format('LL')}
                                </span>
                              </Col>
                              <Col>
                                <div className='inline-block ml-2 shadow-md animate-ping bg-red-500 w-1 h-1 rounded-full '></div>
                              </Col>
                            </Row>

                              <Progress
                                size='small'
                                status='exception'
                                showInfo={false}
                                percent={10}
                              />
                            </Col>
                          </>
                        ) : (
                          <Col align='right' span={12}>
                            <button
                              className={`bg-black text-white font-bold rounded px-4 py-2 outline-none`}
                            >
                             View
                            </button>
                          </Col>
                        )}
                      </Row>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}

        {(tokenData.fetching === true ||
          tokenData.tokens.length == 0 ||
          loading === true) &&
          array.map((each) => (
            <Col
              sm={24}
              md={10}
              lg={5}
              key={each}
              className=' bg-white mx-4 h-9/12 mb-5 rounded-lg border-2 flex flex-col w-full border-gray-100 shadow-md hover:shadow-xd cursor-pointer'
            >
              <div className='h-72 w-full object-cover bg-gray-200 animate-pulse  card-img-top rounded-t-lg'></div>
              <div className='flex flex-col flex-1 gap-5 sm:p-2 p-4'>
                <div className='flex flex-col flex-1 gap-5 sm:p-2'>
                  <div className='flex flex-1 flex-col gap-3'>
                    <div className='bg-gray-200 w-full animate-pulse h-14 rounded-2xl'></div>
                    <div className='bg-gray-200 w-full animate-pulse h-3 rounded-2xl'></div>
                    <div className='bg-gray-200 w-full animate-pulse h-3 rounded-2xl'></div>
                  </div>
                  <div className='mt-auto flex gap-3'>
                    <div className='bg-gray-200 w-20 h-8 animate-pulse rounded-full'></div>
                    <div className='bg-gray-200 w-20 h-8 animate-pulse rounded-full'></div>
                    <div className='bg-gray-200 w-20 h-8 animate-pulse rounded-full ml-auto'></div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        {showMore && tokenData.fetching === false && (
          <div className='w-full mb-3 text-center'>
            <button
              onClick={loadMore}
              className={`bg-black w-32 text-white font-bold cursor-pointer rounded px-4 py-2 outline-none ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {!loading ? (
                "load more"
              ) : (
                <Row justify='center'>
                  <img
                    className='text-white w-5 h-5 animate-spin mx-4 text-center'
                    src='/images/spinner.png'
                  />
                </Row>
              )}
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
};
