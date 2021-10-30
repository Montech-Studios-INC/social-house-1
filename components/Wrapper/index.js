import { collections } from "../Nav/dummyData";
import { Row, Col, Collapse, Space, Dropdown, Menu } from "antd";
import { useState } from "react";

const { Panel } = Collapse;

const menu = (
  <Menu>
    <Menu.Item key='0'>Recently active</Menu.Item>
    <Menu.Item key='1'>Ending soon</Menu.Item>
    <Menu.Item key='3'>Lowest price</Menu.Item>
  </Menu>
);

const sortStatus = [
  {
    label: "All",
  },
  {
    label: "Live",
  },
  {
    label: "Sold",
  },
  {
    label: "Reserve",
  },
];

const sortMedia = [
  {
    label: "Image",
  },
  {
    label: "GIF",
  },
  {
    label: "Video",
  },
  {
    label: "Audio",
  },
  {
    label: "Text",
  },
  {
    label: "HTML",
  },
];

const sortPrice = [
  {
    label: "< 1 ETH",
  },
  {
    label: "< 10 ETH",
  },
  {
    label: "< 50 ETH",
  },
  {
    label: "< 100ETH",
  },
];

const Wrapper = ({ children }) => {
  const [toggle, setToggle] = useState(true);
  const [filters, setFilters] = useState({});

  const changeStatus = (label, filterName) => {
    if (filters[filterName] === label) {
      const filtersCopy = { ...filters };
      delete filtersCopy[filterName];
      setFilters(filtersCopy);
    } else {
      setFilters({ ...filters, [filterName]: label });
    }
  };

  return (
    <div className='pt-20'>
      <Row justify='center' align='middle' className='w-12/13 m-auto py-5'>
        <Col xs={12} sm={16}>
          <div className='flex items-center'>
            <div
              onClick={() => setToggle(!toggle)}
              className='bg-gray-100 w-28 py-2 px-4 font-bold rounded-full cursor-pointer relative flex items-center justify-center'
            >
              {Object.keys(filters).length > 0 && (
                <div className='absolute flex items-center justify-center top-0 right-0 bg-black text-white rounded-full text-xs w-5 h-5'>
                  {Object.keys(filters).length}
                </div>
              )}
              {toggle && <i className='fas fa-angle-left mr-2' />} Filters
            </div>
            {!toggle && (
              <div className='ml-2 hidden md:block'>
                {Object.entries(filters).map(([key, index]) => {
                  return (
                    <div
                      key={index}
                      onClick={() => changeStatus(index, key)}
                      className='inline-block font-bold rounded-full px-3 py-2 tags border-2 border-gray-400 cursor-pointer mr-2'
                    >
                      {index}
                      <i className='fas fa-times ml-2' />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Col>
        <Col xs={12} sm={8} className='font-bold text-right'>
          <Dropdown overlay={menu} trigger={["click"]}>
            <span
              onClick={(e) => e.preventDefault()}
              className='cursor-pointer'
            >
              Recent active <i className='fas fa-angle-down'></i>
            </span>
          </Dropdown>
        </Col>
      </Row>
      <div className='w-12/13 m-auto flex' style={{ height: "80vh" }}>
        {toggle && (
          <div className='h-5/6 md:h-full border-none md:border-r-2 md:border-gray-200 sidebar overflow-y-auto absolute z-20 bg-white md:static w-full sm:w-full md:w-1/3 lg:w-1/6'>
            <Collapse defaultActiveKey={["1", "2", "3"]} bordered={false} ghost>
              <Panel header='Status' key='1' className='font-bold mb-3'>
                {sortStatus.map((status, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => changeStatus(status.label, "status")}
                      className={`inline-block font-bold border-gray-200 rounded-full px-3 py-2 tags text-black transition-all duration-300 border-2 cursor-pointer mr-2 m-2 ${
                        filters.status === status.label
                          ? "bg-black text-white"
                          : ""
                      }`}
                      onAnimationEnd={() => setEffect(false)}
                    >
                      {status.label}
                    </div>
                  );
                })}
              </Panel>
              <Panel
                header='Media Type'
                key='2'
                className='font-bold mb-3 border-t-2 border-gray-200'
              >
                {sortMedia.map((status, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => changeStatus(status.label, "mediaType")}
                      className={`inline-block font-bold rounded-full px-3 py-2 tags border-2 transition-all duration-300 border-gray-200 cursor-pointer mr-2 mb-2 ${
                        filters.mediaType === status.label
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {status.label}
                    </div>
                  );
                })}
              </Panel>
              <Panel
                header='Price'
                key='3'
                className='font-bold mb-3 border-t-2 border-gray-200'
              >
                {sortPrice.map((status, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => changeStatus(status.label, "price")}
                      className={`inline-block font-bold rounded-full px-3 py-2 tags border-2 transition-all duration-300 cursor-pointer border-gray-200 mr-2 mb-2 ${
                        filters.price === status.label
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {status.label}
                    </div>
                  );
                })}
              </Panel>
              <Panel
                header='Collections'
                key='4'
                className='font-bold mb-3 border-t-2 border-gray-200'
              >
                <input
                  type='text'
                  placeholder='Search collections..'
                  className='bg-gray-100 px-2 py-2 rounded w-full font-semibold'
                />
                <Row
                  style={{ height: 450 }}
                  className='overflow-auto w-full'
                  align='middle'
                >
                  <div className='flex flex-col'>
                    {collections.map((col, index) => {
                      return (
                        <Space
                          key={index}
                          direction='horizontal'
                          className='my-4'
                        >
                          <input
                            type='checkbox'
                            checked={filters[col.label]}
                            className='mr-2 h-4 w-4 text-gray-600'
                            onChange={(e) => changeStatus(col.label, col.label)}
                          />
                          <img
                            src={col.imageUrl}
                            width={50}
                            height={50}
                            align='collection'
                            className='rounded-full'
                          />
                          <div>
                            <div>{col.label}</div>
                            <div className='font-normal text-gray-500'>
                              {col.items.toLocaleString("EN")} items
                            </div>
                          </div>
                        </Space>
                      );
                    })}
                  </div>
                </Row>
              </Panel>
            </Collapse>
          </div>
        )}
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  );
};

export default Wrapper;
