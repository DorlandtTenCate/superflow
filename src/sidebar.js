import React from 'react';
import Input from './input';

export default function Sidebar({ state }) {
  const { q, n, s, sbd, sbw, wh, lwd, lsh, lsd, rsh, rsd, rwd } = state;
  return (
    <div className="sidebar">
      <h2 className="font-bold text-2xl">Summer bed</h2>
      <div className="lg:flex">
        <Input
          className="w-full"
          label={
            <>
              Flow rate in m<sup>3</sup>/s
            </>
          }
          value={q}
          step="10"
        />
      </div>
      <div className="lg:flex">
        <Input
          className="w-full lg:w-1/2 mr-8"
          label={
            <>
              <a
                className="underline"
                href="http://www.fsl.orst.edu/geowater/FX3/help/8_Hydraulic_Reference/Mannings_n_Tables.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Roughness coefficient (Manning)
              </a>
            </>
          }
          value={n}
          step="0.001"
          min="0.001"
        />
        <Input className="w-full lg:w-1/2" label="Slope decline (m/m)" value={s} step="0.01" />
      </div>

      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 mr-8" label="Width of the summer bed in m" value={sbw} />
        <Input className="w-full lg:w-1/2" label="Depth of the summer bed in m" value={sbd} />
      </div>
      <hr className="mt-4" />
      <h2 className="font-bold text-2xl">Dykes</h2>
      <div className="lg:flex">
        <Input className="w-full" label="Height of winter dykes" value={wh} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 lg:mr-8" label="Distance of left winter dyke" value={lwd} />
        <Input className="w-full lg:w-1/2" label="Distance of right winter dyke" value={rwd} />
      </div>
      <div className="lg:flex">
        <Input className="w-full lg:w-1/2 lg:mr-8" label="Height of left summer dyke" value={lsh} max={wh[0]} />
        <Input className="w-full lg:w-1/2" label="Height of right summer dyke" value={rsh} max={wh[0]} />
      </div>
      <div className="lg:flex">
        <Input
          className="w-full lg:w-1/2 lg:mr-8"
          label="Distance of left summer dyke"
          value={lsd}
          max={lwd[0] - lsh[0]}
        />
        <Input className="w-full lg:w-1/2" label="Distance of right summer dyke" value={rsd} max={rwd[0] - rsh[0]} />
      </div>
      <hr className="mt-4" />
    </div>
  );
}
