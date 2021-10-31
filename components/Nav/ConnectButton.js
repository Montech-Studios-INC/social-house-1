import { Button, Box, Text, Spacer } from "@chakra-ui/react";
import { useEthers, useEtherBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import Identicon from "./Identicon";
import { useEffect, useState, useContext } from "react";
import { GlobalContext } from '../../contexts/provider';
import { Row, Col, Modal} from "antd";
import { wallets } from "./dummyData";
import { Menu, Dropdown } from 'antd';
import * as actions from '../../contexts/actions';

// import ConnectWalletModal from './MetaMask';

const menu = (
  <Menu>
    <Menu.Item className="h-12">
      <a  rel="noopener noreferrer" href="/list">
        List for Sale
      </a>
    </Menu.Item>
    <Menu.Item className="h-12">
      <a  rel="noopener noreferrer" href="/mint">
        Mint new NFT
      </a>
    </Menu.Item>
    
  </Menu>
);


export default function ConnectButton({ handleOpenModal }) {
  const { activateBrowserWallet, account, chainId, error, deactivate, activate, active, library } = useEthers();
  const etherBalance = useEtherBalance(account);
  const [connectError, setError] = useState(null)

  const {
     showModalState: {
      showModal,
    },
    setShowModal,
  } = useContext(GlobalContext);

  const  handleConnectWallet = async() => {
      activateBrowserWallet();
  }

  const networks = {
    '1': 'Mainnet',
    '4': 'Rinkeby'
  }


  useEffect(()=>{
    if ((account !== null || account !== undefined) && (chainId?.toString() !== process.env.NEXT_PUBLIC_NETWORK_ID)){
      deactivate();
      setError(`Unsopported Chain, connect to ${networks[parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)]} chain`)
    }
    else{
      setError('');
    }
    if(error){
      setError('User Denied permission!')
    }

  },[chainId, account, error, library])
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => {
    // setIsModalVisible(false);
    actions.changeAuthModal(!showModal)(setShowModal);
  };


  const openModal = () => {
    // setIsModalVisible(true);
    actions.changeAuthModal(!showModal)(setShowModal);
  };

  const ConnectWalletModal = ({ isModalVisible, closeModal }) => {
    return (
      <>
      <Modal
        title={false}
        footer={false}
        visible={showModal}
        onCancel={closeModal}
        closable={false}
      >
        <Row className="mb-5">
          <Col span={20} className="flex-1 font-bold text-lg">
            Connect wallet
          </Col>
          <Col  span={4} className="flex-1">
            <svg onClick={closeModal} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
            </svg>
          </Col>
        </Row>
        <Row justify="center">
          {wallets.map((wallet, index) => {
            return (
              <Col
                key={index}
                align="middle"
                span={11}
                className="py-3 cursor-pointer hover:bg-gray-100 hover:shadow-xl transition-all duration-500 mb-10"
                onClick={() => handleConnectWallet()}
              >
                <img src={wallet.icon} />
                <div className="mt-2 font-bold">{wallet.label}</div>
              </Col>
            );
          })}
        </Row>
        {chainId?.toString() !== process.env.NEXT_PUBLIC_NETWORK_ID && (
           <div className="text-center font-bold pt-10">
           <spa class="cursor-pointer text-red-500 hover:text-red-600 transition-all duration-500">
             {connectError}
           </spa>
         </div>
        )}
       
        <div className="text-center font-bold pt-10">
          <spa class="cursor-pointer hover:text-gray-500 transition-all duration-500">
            Dont have a wallet? Get one
          </spa>
        </div>
      </Modal>
      </>
    );
  };

  return account ? (
    <div className="hidden xl:flex lg:flex md:flex flex-row justify-end ">
      {/* <div className="bg-gray-300">
        <Text color="gray-400" className="m-2" fontSize="md">
          {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH
        </Text>
      </div> */}
      <Button
        onClick={handleOpenModal}
        bg={"black"}
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="sm"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {account &&
            `${account.slice(0, 6)}...${account.slice(
              account.length - 4,
              account.length
            )}`}
        </Text>
        <Identicon />
      </Button>
      <Dropdown overlay={menu}>
      <button
        type="button"
            onClick={openModal}
            className="bg-black hover:bg-gray-700 text-white font-bold rounded py-3 px-3 h-10 outline-none flex flex-row ml-3"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-200 text-sm ">New</p>
       </button>
      </Dropdown>
    </div>
  ) : (
    <>
    <ConnectWalletModal isModalVisible={isModalVisible} closeModal={closeModal} />
      <button
        type="button"
            onClick={openModal}
            className="bg-black text-white font-bold rounded px-4 py-2 outline-none"
        >
        Connect wallet
       </button>
       </>
  );
}