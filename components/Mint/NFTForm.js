import React from 'react'

function NFTForm({name, setName, Description, setDescription}) {
    return (
        <div className='my-2 p-5'>
                <p className='text-2xl font-bold mb-5'>Metadata content</p>
                <div class='w-full my-2 flex flex-col items-center content-center'>
                  <div class='mb-4 w-12/13 md:w-1/2 text-justify'>
                    <label
                      class='block text-gray-400 text-sm mb-2 font-bold'
                      for='name'
                    >
                      Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      id='name'
                      type='text'
                      placeholder='Name'
                    />
                  </div>
                  <div class='mb-6 w-12/13 md:w-1/2 text-justify'>
                    <label
                      class='block text-gray-400 text-sm mb-2 font-bold'
                      for='Description'
                    >
                      description
                    </label>
                    <textarea
                      value={Description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      class='shadow appearance-none border h-20 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
                      id='Description'
                      type='Description'
                      placeholder='Description'
                    />
                  </div>
                </div>
              </div>
    )
}

export default NFTForm
