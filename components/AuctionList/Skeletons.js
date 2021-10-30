import React from "react";
import { Col } from "antd";

const array = [1,2,3,4,5,6,7,8]

export const Skeletons = ({ tokenData, loading}) => {
return (
    <Col
    sm={24}
    md={10}
    lg={5}
    key={each}
    className=" bg-white mx-4 h-9/12 mb-5 rounded-lg border-2 flex flex-col w-full border-gray-100 shadow-md hover:shadow-xd cursor-pointer"
  >
  <div className="h-72 w-full object-cover bg-gray-200 animate-pulse  card-img-top rounded-t-lg" ></div>
  <div class="flex flex-col flex-1 gap-5 sm:p-2 p-4">
  <div class="flex flex-col flex-1 gap-5 sm:p-2">
  <div class="flex flex-1 flex-col gap-3">
    <div class="bg-gray-200 w-full animate-pulse h-14 rounded-2xl" ></div>
    <div class="bg-gray-200 w-full animate-pulse h-3 rounded-2xl" ></div>
    <div class="bg-gray-200 w-full animate-pulse h-3 rounded-2xl" ></div>
  </div>
  <div class="mt-auto flex gap-3">
    <div class="bg-gray-200 w-20 h-8 animate-pulse rounded-full" ></div>
    <div class="bg-gray-200 w-20 h-8 animate-pulse rounded-full" ></div>
    <div class="bg-gray-200 w-20 h-8 animate-pulse rounded-full ml-auto" ></div>
  </div>
</div>
  </div>
  
</Col>
)
};
  