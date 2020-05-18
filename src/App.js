import React, { useState } from 'react';

import FlowModel from './flow-model';
import Sidebar from './sidebar';
import './App.css';

function App() {
  const state = {
    q: useState(150),
    d: useState(3.5),
    w: useState(10),
    v: useState(6),
    lwh: useState(4),
    lwd: useState(15),
    lsh: useState(2.5),
    lsd: useState(5),
    rsh: useState(2.5),
    rsd: useState(5),
    rwh: useState(4),
    rwd: useState(15),
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
