import React from 'react';

export default function FlowModel({ state }) {
  const {
    lwdh: [lwdh],
    lwdd: [lwdd],
    lsdh: [lsdh],
    lsdd: [lsdd],
    rsdh: [rsdh],
    rsdd: [rsdd],
    rwdh: [rwdh],
    rwdd: [rwdd],
    sbd: [sbd],
    sbw: [sbw],
  } = state;

  const waterLevel = () => 1;

  // Value of highest dyke
  const maxDh = () => Math.max(...[lwdh, lsdh, rsdh, rwdh]);

  function dimensions() {
    const md = { width: lwdd + sbw + rwdd, height: maxDh() + sbd };
    if (md.width < md.height * 2) md.width = md.height * 2;
    if (md.height < md.width / 2) md.height = md.width / 2;
    return md;
  }

  // Convert metric height to SVG height
  const h = (m) => (m / dimensions().height) * 450;

  // Convert metric width to SVG width
  const w = (m) => (m / dimensions().width) * 900;

  // Convert metric top to SVG top
  const t = (m) => 25 + h(m);

  // Convert metric bottom to SVG top
  const b = (m) => t(dimensions().height - m);

  // Convert metric left to SVG left
  const l = (m) => 50 + w(m);

  // Convert metric right to SVG left
  const r = (m) => l(dimensions().width - m);

  function Sky() {
    return <rect className="text-blue-300 fill-current w-full h-full" />;
  }
  function Ground() {
    return <rect className="text-yellow-900 fill-current h-full w-full" y={b(sbd)} />;
  }
  function Dyke({ side, distance, height }) {
    const left = side == 'left' ? lwdd - distance : lwdd + distance + sbw;
    const width = height / 2;

    return (
      // <h1>{x}</h1>
      // <path
      //   className="text-green-900 fill-current"
      //   d={`M ${left - width / 2} ${b(sbd)} a ${width / 2} ${h(height)} 0 0 1 ${width} 0`}
      // />
      <ellipse
        className="text-yellow-600 fill-current"
        cx={l(left)}
        cy={b(sbd) + h(height)}
        rx={w(width)}
        ry={h(height * 2)}
      />
    );
  }

  return (
    <div class="flow-model">
      <svg className="w-full" viewBox="0 0 1000 500">
        <Sky />
        <Dyke side="left" height={lwdh} distance={lwdd} />
        <Dyke side="left" height={lsdh} distance={lsdd} />
        <Dyke side="right" height={rsdh} distance={rsdd} />
        <Dyke side="right" height={rwdh} distance={rwdd} />
        <Ground />
        {/* <FlowArea /> */}
        <mask id="flow-area-mask">
          <path
            className="text-white h-48 fill-current"
            d={`M ${l(lwdd)} ${b(sbd)} a ${w(sbw) / 2} ${h(sbd)} 0 0 0 ${w(sbw)} 0`}
          />
        </mask>
        <rect className="text-blue-300 fill-current w-full h-full" mask="url(#flow-area-mask)" />
        <rect className="text-blue-800 fill-current w-full h-full" mask="url(#flow-area-mask)" y={b(waterLevel())} />
        {/* <rect id="winter-dyke-left" x="50" y="410" />
        <rect id="summer-dyke-left" x="250" y="460" />
        <rect id="summer-dyke-right" x="870" y="460" />
        <rect id="winter-dyke-right" x="950" y="410" />
        <line id="reference-height" x1="0" y1="950" x2="1000" y2="950" /> */}
      </svg>
    </div>
  );
}
