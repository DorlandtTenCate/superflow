import React, { useState } from 'react';

import FlowModel from './flow-model';
import Sidebar from './sidebar';
import './App.css';

function App() {
  const state = {
    q: useState(750),
    n: useState(0.035),
    s: useState(0.1),
    sbd: useState(3.5),
    sbw: useState(10),
    wh: useState(4),
    lwd: useState(15),
    lsh: useState(2.5),
    lsd: useState(5),
    rsh: useState(2.5),
    rsd: useState(5),
    rwd: useState(15),
  };

  return (
    <>
      <h1 className="font-bold text-5xl">Superflow v0.9.1</h1>
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
