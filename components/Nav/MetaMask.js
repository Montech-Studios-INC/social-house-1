import React from 'react'
import { Row, Col, Modal} from "antd";
import { wallets } from "./dummyData";

const ConnectWalletModal = ({ isModalVisible, closeModal, handleConnectWallet }) => {
    return (
      <>
      <Modal
        title={false}
        footer={false}
        visible={isModalVisible}
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
                className="py-3 cursor-pointer hover:bg-gray-100 transition-all duration-500 mb-10"
                onClick={() => handleConnectWallet()}
              >
                <img src={wallet.icon} />
                <div className="mt-2 font-bold">{wallet.label}</div>
              </Col>
            );
          })}
        </Row>
        <div className="text-center font-bold pt-10">
          <spa class="cursor-pointer hover:text-gray-500 transition-all duration-500">
            Dont have a wallet? Get one
          </spa>
        </div>
      </Modal>
      </>
    );
  };

  export default ConnectWalletModal;