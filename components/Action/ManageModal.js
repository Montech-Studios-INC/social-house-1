import React, {useState} from 'react'
import { Row, Modal, notification } from "antd";

const ManageModal = ({setVisible, visible, handleEndAuction, auctionId, handleCancelAuction, status, handleListItem}) => {

    const [amount, setAmount] = useState(0)
    const [curatorAddress, setCuratorAddress] = useState('')
    const [curatorFee, setCuratorFee] = useState(0)
    const [duration, setDuration] = useState(0)
    const [loading, setLoading] = useState(false)

    const showModal = () => {
        setVisible(true);
    };
  
    const handleOk = () => {
        setVisible(false);
    };
  
    const handleCancel = () => {
        setVisible(false);
    };  

    return (
        <>
        {status === "Active" && (<Modal title="Basic Modal" visible={visible} onOk={handleOk} onCancel={handleCancel}>
            <div>
            <div className="flex flex-row justify-between">
                <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleCancelAuction(auctionId)}}>Cancel Auction</button>
                <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleEndAuction(auctionId)}} >End Auction</button>
            </div>
            </div>
        </Modal>)
        }
        {status !== "Active" ? <p className="text-md text-gray-500 font-bold">List This NFT for Auction ?</p> : ''}
        {status !== "Active" ? (
            <div class='w-full my-2 flex flex-col items-center content-center'>
            <div class='mb-4 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='name'
              >
                Reserve Price
              </label>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Reserve price'
                type='text'
                placeholder='Reserve price'
              />
            </div>

            <div class='mb-6 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                Curator Fee percentage
              </label>
              <input
                value={curatorFee}
                onChange={(e) => {
                  setCuratorFee(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Curator fee percentage'
                type='text'
                placeholder='Curator fee percentage'
              />
            </div>
            <div class='mb-6 w-12/13 md:w-1/2 text-justify'>
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                Duration
              </label>
              <input
                value={duration}
                onChange={(e) => {
                setDuration(e.target.value);
                }}
                class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='Curator fee percentage'
                type='Number'
                placeholder='Curator fee percentage'
              />
              <label
                class='block text-gray-400 text-sm mb-2 font-bold'
                for='Description'
              >
                In Seconds
              </label>
            </div>
            <button className={`bg-black text-white font-light rounded px-4 py-2 outline-none w-1/3 mt-2 text-sm`} onClick={()=>{handleListItem(amount, curatorAddress, curatorFee, duration , setLoading)}}>{!loading ? (
                  "List NFT"
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
        ) : ''}
        </>
    )
}

export default ManageModal;