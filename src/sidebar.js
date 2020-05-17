import React from 'react';
import Input from './input';

export default function Sidebar({ state }) {
  const { fr, lwdh, lwdd, lsdh, lsdd, rsdh, rsdd, rwdh, rwdd, sbd, sbw } = state;
  return (
    <div class="sidebar">
      <h2 className="font-bold text-2xl">Summer bed</h2>
      <Input
        className="w-full"
        label={
          <>
            Flow rate in m<sup>3</sup>/sec
          </>
        }
        value={fr}
      />
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Width of the summer bed" value={sbw} />
        <Input className="w-full lg:w-1/2" label="Depth of the summer bed" value={sbd} />
      </div>
      <hr class="mt-4" />
      <h2 className="font-bold text-2xl">Dyke heights</h2>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of left winter dyke" value={lwdh} />
        <Input className="w-full lg:w-1/2" label="Distance of left winter dyke" value={lwdd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of left summer dyke" value={lsdh} />
        <Input className="w-full lg:w-1/2" label="Distance of left summer dyke" value={lsdd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of right summer dyke" value={rsdh} />
        <Input className="w-full lg:w-1/2" label="Distance of right summer dyke" value={rsdd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of right winter dyke" value={rwdh} />
        <Input className="w-full lg:w-1/2" label="Distance of right winter dyke" value={rwdd} />
      </div>
      <hr class="mt-4" />
    </div>
  );
}
