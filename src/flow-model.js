import React from 'react';
import { solve } from 'solv.js';

export default function FlowModel({ state }) {
  const {
    lwh: [lwh],
    lwd: [lwd],
    lsh: [lsh],
    lsd: [lsd],
    rsh: [rsh],
    rsd: [rsd],
    rwh: [rwh],
    rwd: [rwd],
    d: [d],
    w: [w],
    q: [q],
    n: [n],
  } = state;

  // Value of highest dyke
  const maxDh = Math.max(...[lwh, lsh, rsh, rwh]);

  const scale = {
    width: lwh + lwd + 0.5 + w + 0.5 + rwd + rwh,
    height: maxDh + d + 1,
  };

  // Maintain aspect ratio
  if (scale.width < scale.height * 2) scale.width = scale.height * 2;
  if (scale.height < scale.width / 2) scale.height = scale.width / 2;

  // Allocate up to 90% of image size
  scale.factor = 450 / scale.height;

  const _s = (m) => m * scale.factor;

  // Convert metric top to SVG top
  const _t = (m) => 25 + _s(m);

  // Convert metric bottom to SVG top
  const _b = (m) => _t(scale.height - m);

  // Convert metric left to SVG left
  const _l = (m) => 50 + _s(m);

  // Convert metric right to SVG left
  const _r = (m) => _l(scale.width - m);

  function Q(d) {
    if (d < 0) return -1;
    return w * d * (1 / n) * Math.pow((w * d) / (w + 2 * d), 2 / 3) * Math.sqrt(0.1);
  }

  // const waterLevel = goalSeek({
  //   fn: Q,
  //   goal: q,
  //   fnParams: [0],
  //   maxIterations: 1000,
  //   maxStep: 10,
  //   independentVariableIdx: 0,
  //   percentTolerance: 0.1,
  // });

  let waterLevel;

  try {
    waterLevel = solve(Q, q);
  } catch {
    waterLevel = 0;
  }

  function Sky() {
    return <rect className="text-blue-300 fill-current w-full h-full" />;
  }
  function Ground() {
    return <rect className="text-yellow-900 fill-current h-full w-full" y={_b(d)} />;
  }
  function Dyke({ side, distance, height }) {
    return (
      <ellipse
        className="text-yellow-800 fill-current"
        cx={
          side === 'left'
            ? _l(lwh + lwd - distance - height / 2)
            : _l(lwh + lwd + 0.5 + w + 0.5 + distance + height / 2)
        }
        // cx={side === 'left' ? l(lwd - distance) : l(lwd + distance + w)}
        cy={_b(d) + _s(height)}
        rx={_s(height / 2)}
        ry={_s(height * 2)}
      />
    );
  }

  return (
    <div class="flow-model">
      <svg className="w-full" viewBox="0 0 1000 500">
        <Sky />
        <Dyke side="left" height={lwh} distance={lwd} />
        <Dyke side="left" height={lsh} distance={lsd} />
        <Dyke side="right" height={rsh} distance={rsd} />
        <Dyke side="right" height={rwh} distance={rwd} />
        <Ground />
        <mask id="flow-area-mask">
          <path
            className="text-white h-48 fill-current"
            d={`M ${_l(lwh + lwd)} ${_b(d)}
              a ${_s(0.5)} ${_s(0.5)} 0 0 1 ${_s(0.5)} ${_s(0.5)}
              v ${_s(d) - _s(1)}
              a ${_s(0.5)} ${_s(0.5)} 0 0 0 ${_s(0.5)} ${_s(0.5)}
              h ${_s(w) - _s(1)}
              a ${_s(0.5)} ${_s(0.5)} 0 0 0 ${_s(0.5)} -${_s(0.5)}
              v ${-_s(d) + _s(1)}
              a ${_s(0.5)} ${_s(0.5)} 0 0 1 ${_s(0.5)} -${_s(0.5)}
              z`}
          />
        </mask>
        <rect className="text-blue-300 fill-current w-full h-full" mask="url(#flow-area-mask)" />
        <rect className="text-blue-800 fill-current w-full h-full" mask="url(#flow-area-mask)" y={_b(waterLevel)} />
        {/* <rect id="winter-dyke-left" x="50" y="410" />
        <rect id="summer-dyke-left" x="250" y="460" />
        <rect id="summer-dyke-right" x="870" y="460" />
        <rect id="winter-dyke-right" x="950" y="410" />
        <line id="reference-height" x1="0" y1="950" x2="1000" y2="950" /> */}
      </svg>
    </div>
  );
}
