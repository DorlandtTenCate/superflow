import React from 'react';

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
    v: [v],
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

  scale.factor = 450 / scale.height;

  const s = (m) => m * scale.factor;

  const waterLevel = q / v / w;

  // Convert metric top to SVG top
  const t = (m) => 25 + s(m);

  // Convert metric bottom to SVG top
  const b = (m) => t(scale.height - m);

  // Convert metric left to SVG left
  const l = (m) => 50 + s(m);

  // Convert metric right to SVG left
  const r = (m) => l(scale.width - m);

  function Sky() {
    return <rect className="text-blue-300 fill-current w-full h-full" />;
  }
  function Ground() {
    return <rect className="text-yellow-900 fill-current h-full w-full" y={b(d)} />;
  }
  function Dyke({ side, distance, height }) {
    // let cx = width / 2;
    // cx =
    // left = lwd - distance - width;

    // right = distance;

    return (
      <ellipse
        className="text-yellow-800 fill-current"
        cx={
          side === 'left' ? l(lwh + lwd - distance - height / 2) : l(lwh + lwd + 0.5 + w + 0.5 + distance + height / 2)
        }
        // cx={side === 'left' ? l(lwd - distance) : l(lwd + distance + w)}
        cy={b(d) + s(height)}
        rx={s(height / 2)}
        ry={s(height * 2)}
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
            d={`M ${l(lwh + lwd)} ${b(d)}
              a ${s(0.5)} ${s(0.5)} 0 0 1 ${s(0.5)} ${s(0.5)}
              v ${s(d) - s(1)}
              a ${s(0.5)} ${s(0.5)} 0 0 0 ${s(0.5)} ${s(0.5)}
              h ${s(w) - s(1)}
              a ${s(0.5)} ${s(0.5)} 0 0 0 ${s(0.5)} -${s(0.5)}
              v ${-s(d) + s(1)}
              a ${s(0.5)} ${s(0.5)} 0 0 1 ${s(0.5)} -${s(0.5)}
              z`}
          />
        </mask>
        <rect className="text-blue-300 fill-current w-full h-full" mask="url(#flow-area-mask)" />
        <rect className="text-blue-800 fill-current w-full h-full" mask="url(#flow-area-mask)" y={b(waterLevel)} />
        {/* <rect id="winter-dyke-left" x="50" y="410" />
        <rect id="summer-dyke-left" x="250" y="460" />
        <rect id="summer-dyke-right" x="870" y="460" />
        <rect id="winter-dyke-right" x="950" y="410" />
        <line id="reference-height" x1="0" y1="950" x2="1000" y2="950" /> */}
      </svg>
    </div>
  );
}
