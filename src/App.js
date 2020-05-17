import React, { useState } from 'react';

import FlowModel from './flow-model';
import Sidebar from './sidebar';
import './App.css';

function App() {
  const state = {
    fr: useState(800),
    lwdh: useState(4),
    lwdd: useState(15),
    lsdh: useState(2.5),
    lsdd: useState(5),
    rsdh: useState(2.5),
    rsdd: useState(5),
    rwdh: useState(4),
    rwdd: useState(15),
    sbd: useState(3.5),
    sbw: useState(10),
  };

  return (
    <>
      <h1 className="font-bold text-5xl">Superflow v0.1</h1>
      <div className="md:flex border-t border-gray-400">
        <div className="w-full min-w-40 md:w-2/5 xl:w-1/4 px-4 py-8">
          <Sidebar state={state} />
        </div>
        <div className="w-full md:w-3/5 xl:w-3/4 px-4 py-8">
          <FlowModel state={state} />
        </div>
      </div>
    </>
  );
}

export default App;
