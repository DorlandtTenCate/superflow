import React from 'react';
import Input from './input';

export default function Sidebar({ state }) {
  const { q, n, s, sbd, sbw, lwh, lwd, lsh, lsd, rsh, rsd, rwh, rwd } = state;
  return (
    <div class="sidebar">
      <h2 className="font-bold text-2xl">Summer bed</h2>
      <div className="lg:flex">
        <Input
          className="w-full mr-8"
          label={
            <>
              Flow rate in m<sup>3</sup>/s
            </>
          }
          value={q}
        />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2" label="Roughness coefficient (Manning)" value={n} />
        <Input className="w-full lg:w-1/2" label="Slope decline (m/m)" value={s} />
      </div>

      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Width of the summer bed in m" value={sbw} />
        <Input className="w-full lg:w-1/2" label="Depth of the summer bed in m" value={sbd} />
      </div>
      <hr class="mt-4" />
      <h2 className="font-bold text-2xl">Dykes</h2>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of left winter dyke" value={lwh} />
        <Input className="w-full lg:w-1/2" label="Distance of left winter dyke" value={lwd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of left summer dyke" value={lsh} />
        <Input className="w-full lg:w-1/2" label="Distance of left summer dyke" value={lsd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of right summer dyke" value={rsh} />
        <Input className="w-full lg:w-1/2" label="Distance of right summer dyke" value={rsd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Height of right winter dyke" value={rwh} />
        <Input className="w-full lg:w-1/2" label="Distance of right winter dyke" value={rwd} />
      </div>
      <hr class="mt-4" />
    </div>
  );
}
