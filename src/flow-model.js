import React from 'react';
import { solve } from 'solv.js';

export default function FlowModel({ state }) {
  const {
    lwh: [leftWinterHeight],
    lwd: [leftWinterDistance],
    lsh: [leftSummerHeight],
    lsd: [leftSummerDistance],
    rsh: [rightSummerHeight],
    rsd: [rightSummerDistance],
    rwh: [rightWinterHeight],
    rwd: [rightWinterDistance],
    sbd: [summerBedDepth],
    sbw: [summerBedWidth],
    q: [flowRate],
    n: [manningCoefficient],
    s: [slope],
  } = state;

  let flowArea, wettedPerimeter;

  // ***********
  // * Scaling *
  // ***********
  // Height of highest dyke
  const maxDykeHeight = Math.max(leftWinterHeight, leftSummerHeight, rightSummerHeight, rightWinterHeight);

  const scale = {
    width: leftWinterHeight + leftWinterDistance + 0.5 + summerBedWidth + 0.5 + rightWinterDistance + rightWinterHeight,
    height: maxDykeHeight + summerBedDepth + 1,
  };

  // Maintain 2:1 aspect ratio
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

  /**
   * Calculate using Manning's formula. Assumes n and s to be set in scope
   *
   * @param {*} a Area of the water flow (in m^2)
   * @param {*} p Wetted perimeter (in m)
   * @returns Flow rate in m/s
   */
  function Q(a, p) {
    flowArea = a;
    wettedPerimeter = p;
    if (a < 0 || p < 0) return -1;

    return (1 / manningCoefficient) * a * Math.pow(a / p, 2 / 3) * Math.sqrt(slope);
  }

  const flowAreas = [];

  // Calculate A and P for a full summer bed
  // Summer bed is rectangular, os A = w * h and P = w + 2h (no 2w, because it's open on the top)
  // sb = summer bed
  const summerBedArea = summerBedWidth * summerBedDepth;
  const summerBedVericalPerimeter = 2 * summerBedDepth;
  const summerBedPerimeter = summerBedWidth + summerBedVericalPerimeter;
  flowAreas.push({ type: 'summerBed', maxRate: Q(summerBedArea, summerBedPerimeter) });

  // Calculate max. A and P to stay within summer dykes
  // Same idea: A = summer bed + square between both summer dykes, height of the lowest one.
  // sp = summer plain
  const summerPlainsHeight = Math.min(leftSummerHeight, rightSummerHeight); // Summer Plain Height (i.e. height of lowest summer dyke)
  const summerPlainsWidth = leftSummerDistance + summerBedWidth + rightSummerDistance;
  const summerPlainsArea = summerBedArea + summerPlainsWidth * summerPlainsHeight;
  const summerPlainsVerticalPerimeter = 2 * summerBedDepth + 2 * summerPlainsHeight;
  const summerPlainsPerimeter = summerPlainsVerticalPerimeter + summerPlainsWidth;
  flowAreas.push({ type: 'summerPlains', maxRate: Q(summerPlainsArea, summerPlainsPerimeter) });

  const winterPlainsWidth = leftWinterDistance + summerBedWidth + rightWinterDistance;

  if (leftSummerHeight === rightSummerHeight) {
    // Calculate max A and P for outside of winter dykes. Since their heights are equal, they'll start flowing over at the same moment.
    // lwp = lower winter plain
    const lowerWinterPlainsArea = summerBedArea + winterPlainsWidth * summerPlainsHeight;
    const lowerWinterPlainsVerticalPerimeter = 2 * summerBedDepth + 6 * summerPlainsHeight; // 6 = 4 (twice on both summer dykes) + 2 (inside of both winter dykes)
    const lowerWinterPlainsPerimeter = lowerWinterPlainsVerticalPerimeter + winterPlainsWidth;
    flowAreas.push({ type: 'lowerWinterPlains', maxRate: Q(lowerWinterPlainsArea, lowerWinterPlainsPerimeter) });
  } else {
    const summerDykes = [
      {
        side: 'left',
        height: leftSummerHeight,
        winterDistance: leftWinterDistance,
        oppositeSummerDistance: rightSummerDistance,
      },
      {
        side: 'right',
        height: rightSummerHeight,
        winterDistance: rightWinterDistance,
        oppositeSummerDistance: leftSummerDistance,
      },
    ].sort((a, b) => a.height - b.height);

    // Calculate max A and P for outside of lowest summer dyke
    // lhwp = lower half winter plain
    const halfWinterPlainsWidth =
      summerBedWidth + summerDykes[0].winterDistance + summerDykes[0].oppositeSummerDistance;
    const lowerHalfWinterPlainsArea = summerBedArea + halfWinterPlainsWidth * summerPlainsHeight;
    const lowerHalfWinterPlainsVerticalPerimeter = 2 * summerBedDepth + 4 * summerPlainsHeight;
    const lowerHalfWinterPlainsPerimeter = lowerHalfWinterPlainsVerticalPerimeter + halfWinterPlainsWidth;
    flowAreas.push({
      type: 'lowerHalfWinterPlains',
      maxRate: Q(lowerHalfWinterPlainsArea, lowerHalfWinterPlainsPerimeter),
    });

    // Calculate max A and P for inside of higher summer dyke (i.e. part above lower summer dyke)
    // hwp = half winter plain
    const lowerWinterPlainsHeight = summerDykes[1].height;
    const halfWinterPlainsArea = summerBedArea + halfWinterPlainsWidth * lowerWinterPlainsHeight;
    const halfWinterPlainsVerticalPerimeter =
      2 * summerBedDepth + 2 * summerDykes[0].height + 2 * lowerWinterPlainsHeight;
    const halfWinterPlainsPermeter = halfWinterPlainsVerticalPerimeter + halfWinterPlainsWidth;
    flowAreas.push(Q(halfWinterPlainsArea, halfWinterPlainsPermeter));

    // Calculate max A and P for outside of higher summer dyke
    const winterPlainsWidth = leftWinterDistance + summerBedWidth + rightWinterDistance;
    const winterPlainsArea = summerBedArea + lowerWinterPlainsHeight * winterPlainsWidth;
    const winterPlainsVerticalPerimeter =
      2 * summerBedDepth + 2 * leftSummerHeight + 2 * rightSummerHeight + 2 * lowerWinterPlainsHeight;
    const winterPlainsPerimeter = winterPlainsVerticalPerimeter + winterPlainsWidth;
    flowAreas.push({ type: 'lowerWinterPlains', maxRate: Q(winterPlainsArea, winterPlainsPerimeter) });
  }

  // Calculate max A and P to stay within winter dykes
  const winterPlainsHeight = Math.min(leftWinterHeight, rightWinterHeight);
  const winterPlainsArea = summerBedArea + winterPlainsWidth * winterPlainsHeight;
  const winterPlainsVerticalPerimeter = 2 * summerBedDepth + 4 * summerPlainsHeight + 2 * winterPlainsHeight;
  const winterPlainsPerimeter = winterPlainsVerticalPerimeter + winterPlainsWidth;
  flowAreas.push({ type: 'lowerHalfWinterPlains', maxRate: Q(winterPlainsArea, winterPlainsPerimeter) });

  // Calculates Flow Rate Q for depth d inside summerbed
  function QSummerBed(d) {
    const a = summerBedWidth * d;

    // Wet perimeter W
    const p = summerBedWidth + 2 * d;

    return Q(a, p);
  }

  function QSummerPlains(waterLevel) {
    // Don't bother with the plains if the water fits in the summer bed
    // if (q <= QSummerBed(sbd)) return QSummerBed(d);
    if (waterLevel <= summerBedDepth) return QSummerBed(waterLevel);

    waterLevel -= summerBedDepth;

    const p = summerPlainsWidth + 2 * waterLevel + 2 * summerBedDepth;
    const a = summerBedWidth * summerBedDepth + summerPlainsWidth * waterLevel;

    return Q(a, p);
  }

  function QLowerWinterPlains(a) {
    // The tricky part here is to calculate P. We need the water height of either side based on equal distribution of A.
    const leftWinterPlainWidth = leftWinterDistance - leftSummerDistance;
    const rightWinterPlainWidth = rightWinterDistance - rightSummerDistance;
    const w = leftWinterPlainWidth + rightWinterPlainWidth;

    const overflowArea = a - summerPlainsArea;
    if (overflowArea < 0) return overflowArea;

    // Is either part full?
    let leftArea = 0.5 * overflowArea;
    let rightArea = 0.5 * overflowArea;

    if (leftArea > leftWinterPlainWidth * leftWinterHeight) {
      rightArea += leftArea - leftWinterPlainWidth * summerPlainsHeight;
      leftArea = leftWinterPlainWidth * summerPlainsHeight;
    } else if (rightArea > rightWinterPlainWidth * summerPlainsHeight) {
      leftArea += rightArea - rightWinterPlainWidth * summerPlainsHeight;
      rightArea = rightWinterPlainWidth * summerPlainsHeight;
    }

    const leftHeight = leftArea / leftWinterPlainWidth;
    const rightHeight = rightArea / rightWinterPlainWidth;

    // We count the full outer side of the summer dykes within the perimeter, even though they're not fully immersed
    const vp = leftHeight + 2 * leftSummerHeight + 2 * summerBedDepth + 2 * rightSummerHeight + rightHeight;
    const p = vp + winterPlainsWidth;
    return Q(a, p);
  }

  const waterLevels = {
    // summerBed: 0, // TODO: Currently unused, refactor
    summerPlains: 0,
    leftWinterPlain: 0,
    rightWinterPlain: 0,
    middleWinterPlain: 0,
    upperWinterPlains: 0,
  };

  // Determine which FlowRate area applies to the configured flow rate
  const currentlyFillingFlowArea = flowAreas.find((f) => f.maxRate > flowRate);

  if (currentlyFillingFlowArea) {
    if (currentlyFillingFlowArea.type === 'summerBed' || currentlyFillingFlowArea.type === 'summerPlains') {
      waterLevels.summerPlains = solve(QSummerPlains, flowRate);
    } else {
      waterLevels.summerPlains = summerPlainsHeight + summerBedDepth;
      if (currentlyFillingFlowArea.type === 'lowerWinterPlains') {
        // Equal dykes
        const overflowArea = solve(QLowerWinterPlains, flowRate) - summerPlainsArea;
        const leftWinterPlainWidth = leftWinterDistance - leftSummerDistance;
        const rightWinterPlainWidth = rightWinterDistance - rightSummerDistance;
        const maxLeftWinterPlainArea = leftWinterPlainWidth * summerPlainsHeight;
        const maxRightWinterPlainArea = rightWinterPlainWidth * summerPlainsHeight;
        let leftWinterPlainArea = overflowArea / 2;
        let rightWinterPlainArea = overflowArea / 2;
        if (leftWinterPlainArea > maxLeftWinterPlainArea) {
          rightWinterPlainArea += leftWinterPlainArea - maxLeftWinterPlainArea;
          leftWinterPlainArea = maxLeftWinterPlainArea;
        }
        if (rightWinterPlainArea > maxRightWinterPlainArea) {
          leftWinterPlainArea += rightWinterPlainArea - maxLeftWinterPlainArea;
          leftWinterPlainArea = maxRightWinterPlainArea;
        }

        waterLevels.leftWinterPlain = leftWinterPlainArea / leftWinterPlainWidth;
        waterLevels.rightWinterPlain = rightWinterPlainArea / rightWinterPlainWidth;
      } else if (currentlyFillingFlowArea.type === 'jemoeder') {
        // FIXME
      }
    }
  } else {
    // overflow
  }

  console.log(flowAreas);
  console.log(waterLevels);
  function Sky() {
    return <rect className="text-blue-300 fill-current w-full h-full" />;
  }
  function Ground() {
    return <rect className="text-yellow-900 fill-current h-full w-full" y={_b(summerBedDepth)} />;
  }
  function Dyke({ side, distance, height }) {
    return (
      <ellipse
        className="text-yellow-800 fill-current"
        cx={
          side === 'left'
            ? _l(leftWinterHeight + leftWinterDistance - distance - height / 2)
            : _l(leftWinterHeight + leftWinterDistance + 0.5 + summerBedWidth + 0.5 + distance + height / 2)
        }
        // cx={side === 'left' ? l(lwd - distance) : l(lwd + distance + w)}
        cy={_b(summerBedDepth) + _s(height)}
        rx={_s(height / 2)}
        ry={_s(height * 2)}
      />
    );
  }

  function SummerPlains() {
    return (
      <rect
        className="text-blue-800 fill-current h-full"
        width={_s(summerPlainsWidth + 1 + leftSummerHeight)} // FIXME: Is this correct, or should it be .5lsh + .5rsh?
        x={_l(leftWinterHeight + leftWinterDistance - leftSummerDistance - leftSummerHeight / 2)}
        y={_b(waterLevels.summerPlains)}
      />
    );
  }

  function LeftWinterPlain() {
    return (
      <rect
        className="text-blue-800 fill-current h-full"
        width={_s(leftWinterHeight / 2 + leftWinterDistance - leftSummerDistance - leftSummerHeight / 2)}
        x={_l(leftWinterHeight / 2)}
        y={_b(waterLevels.leftWinterPlain + summerBedDepth)}
      />
    );
  }

  function RightWinterPlain() {
    return (
      <rect
        className="text-blue-800 fill-current h-full"
        width={_s(rightWinterDistance - rightSummerDistance - rightSummerHeight / 2 + rightWinterHeight / 2)}
        x={_l(
          leftWinterHeight +
            leftWinterDistance +
            0.5 +
            summerBedWidth +
            0.5 +
            rightSummerDistance +
            rightSummerHeight / 2
        )}
        y={_b(waterLevels.rightWinterPlain + summerBedDepth)}
      />
    );
  }

  function SummerBed() {
    return (
      <>
        <mask id="flow-area-mask">
          <path
            className="text-white h-48 fill-current"
            d={`M ${_l(leftWinterHeight + leftWinterDistance)} ${_b(summerBedDepth)}
        a ${_s(0.5)} ${_s(0.5)} 0 0 1 ${_s(0.5)} ${_s(0.5)}
        v ${_s(summerBedDepth) - _s(1)}
        a ${_s(0.5)} ${_s(0.5)} 0 0 0 ${_s(0.5)} ${_s(0.5)}
        h ${_s(summerBedWidth) - _s(1)}
        a ${_s(0.5)} ${_s(0.5)} 0 0 0 ${_s(0.5)} -${_s(0.5)}
        v ${-_s(summerBedDepth) + _s(1)}
        a ${_s(0.5)} ${_s(0.5)} 0 0 1 ${_s(0.5)} -${_s(0.5)}
        z`}
          />
        </mask>
        <rect className="text-blue-300 fill-current w-full h-full" mask="url(#flow-area-mask)" />
        <rect
          className="text-blue-800 fill-current w-full h-full"
          mask="url(#flow-area-mask)"
          y={_b(waterLevels.summerPlains)}
        />
      </>
    );
  }

  return (
    <div class="flow-model">
      <p>Water level: {waterLevels.summerPlains.toFixed(2)}m</p>
      <p>
        Flow Area: {flowArea.toFixed(2)}m<sup>2</sup>
      </p>
      <p>Wetted permitere: {wettedPerimeter.toFixed(2)}m</p>
      <svg className="w-full" viewBox="0 0 1000 500">
        <Sky />
        <LeftWinterPlain />
        {/* <MiddleWinterPlain /> */}
        <SummerPlains />
        <RightWinterPlain />
        <Dyke side="left" height={leftWinterHeight} distance={leftWinterDistance} />
        <Dyke side="left" height={leftSummerHeight} distance={leftSummerDistance} />
        <Dyke side="right" height={rightSummerHeight} distance={rightSummerDistance} />
        <Dyke side="right" height={rightWinterHeight} distance={rightWinterDistance} />
        <Ground />
        <SummerBed />
        <line id="reference-height" x1="0" y1="950" x2="1000" y2="950" />
      </svg>
    </div>
  );
}
