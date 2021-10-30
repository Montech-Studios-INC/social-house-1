import Image from "next/image";
import { useState } from "react";
import { Row, Col, Modal, Space } from "antd";
import { wallets, collections, nfts, profiles } from "./dummyData";
import {
  useWalletButton,
  useWeb3Wallet,
} from "@zoralabs/simple-wallet-provider";
import Wallet from "./Wallet";
import Link from "next/link";
// import { useWeb3React } from '@web3-react/core'

const ResultModal = () => {
  const DataLayout = ({ img, label, subLabel, rounded, by }) => {
    return (
      <Row align='middle' justify='space-between'>
        <Col xs={24} md={6} lg={6} align='middle'>
          <Image
            src={img}
            alt='img'
            width={55}
            height={55}
            className={`${rounded ? "rounded-full" : "rounded"}`}
          />
        </Col>
        <Col xs={24} md={17} lg={17} className='text-center sm:text-left'>
          <div className='font-bold w-full '>{label}</div>
          <div className='text-gray-400 w-full'>
            {by && <span className='text-black'>by </span>}
            {subLabel.toLocaleString("en")}
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div className='border-t-2 px-4 mt-2 bg-white'>
      <div className='border-b-2'>
        <div className='font-bold my-5'>Collections</div>
        <Row>
          {collections.map((coln, index) => {
            return (
              <Col
                key={index}
                span={12}
                className='mb-5 px-2 pt-2 hover:bg-gray-100 cursor-pointer'
              >
                <DataLayout
                  img={coln.imageUrl}
                  label={coln.label}
                  subLabel={coln.items}
                  rounded
                />
              </Col>
            );
          })}
        </Row>
      </div>
      <div className='border-b-2'>
        <div>
          <div className='font-bold my-5'>NFTs</div>
          <Row>
            {nfts.map((coln) => {
              return (
                <Col
                  span={12}
                  className='mb-5 px-2 pt-2 hover:bg-gray-100 cursor-pointer'
                >
                  <DataLayout
                    img={coln.profileImage}
                    label={coln.label}
                    subLabel={coln.owner}
                    rounded={false}
                    by={true}
                  />
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
      <div>
        <div className='font-bold my-5'>Profiles</div>
        <Row>
          {profiles.map((coln) => {
            return (
              <Col
                span={8}
                align='middle'
                className='mb-5 py-2 hover:bg-gray-100 cursor-pointer'
              >
                <Space direction='vertical'>
                  <Image
                    src={coln.profileImg}
                    alt='img'
                    width={90}
                    height={90}
                    className='rounded-full'
                    objectFit='cover'
                  />
                  <div className='text-center'>
                    <div className='font-bold'>{coln.username}</div>
                    <div className='text-gray-500'>{coln.name}</div>
                  </div>
                </Space>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

const SearchFilter = ({ onFocus, setOnFocus, userInput, onChangeHandler }) => {
  return (
    <div
      className={`py-2 ${
        onFocus ? "bg-white" : "bg-transparent sm:bg-gray-100"
      } rounded ${
        onFocus ? "w-11/12 sm:w-1/2 lg:w-1/3" : "w-32 sm:w-64 md:w-96"
      }
        transition-all duration-500 m-auto absolute inset-x-0 sm:inset-x-0 top-5 z-30`}
    >
      <div className='w-full flex flex-row'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 text-gray-700 mx-3 mt-1'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
        <input
          type='text'
          placeholder={
            onFocus
              ? "Search for NFTs, Collections and Profiles..."
              : "Search.."
          }
          onFocus={() => setOnFocus(true)}
          onBlur={() => setOnFocus(false)}
          value={userInput}
          onChange={onChangeHandler}
          className='
           bg-grey outline-none text-lg bg-transparent w-1/2 sm:w-9/12'
        ></input>
      </div>
      {userInput !== "" && onFocus && <ResultModal />}
    </div>
  );
};

const navBar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [onFocus, setOnFocus] = useState(false);
  const [userInput, setUserInput] = useState("");

  const onChangeHandler = (e) => {
    const { value } = e.target;
    setUserInput(value);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className='bg-white fixed top-0 w-full z-50 '>
      <div
        style={{ borderBottom: "1px solid lightgray" }}
        className='w-12/13 m-auto inset-0 py-4 '
      >
        <Row align='middle'>
          <Col span={17}>
            <Link href='/'>
              <img
                src='/images/logo.png'
                className='w-12 cursor-pointer h-12'
              />
            </Link>
          </Col>
          <Col span={7} align='right' className='text-right w-1/2'>
            <Wallet className='justify-end' />
          </Col>
        </Row>
      </div>
      <SearchFilter
        onFocus={onFocus}
        setOnFocus={setOnFocus}
        userInput={userInput}
        onChangeHandler={onChangeHandler}
      />
      {onFocus && (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          className='absolute top-0 w-screen h-screen transition-opacity z-20'
        ></div>
      )}
    </div>
  );
};

export default navBar;
