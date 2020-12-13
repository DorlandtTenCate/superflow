import React from 'react';
import { solve } from 'solv.js';

export default function FlowModel({ state }) {
  const {
    wh: [winterHeight],
    lwd: [leftWinterDistance],
    lsh: [leftSummerHeight],
    lsd: [leftSummerDistance],
    rsh: [rightSummerHeight],
    rsd: [rightSummerDistance],
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
  const maxDykeHeight = Math.max(winterHeight, leftSummerHeight, rightSummerHeight);

  const scale = {
    width: winterHeight + leftWinterDistance + 0.5 + summerBedWidth + 0.5 + rightWinterDistance + winterHeight,
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

  const [shortSummerDyke, tallSummerDyke] = [
    {
      side: 'left',
      height: leftSummerHeight,
      summerDistance: leftSummerDistance,
      winterDistance: leftWinterDistance,
      oppositeSummerDistance: rightSummerDistance,
    },
    {
      side: 'right',
      height: rightSummerHeight,
      summerDistance: rightSummerDistance,
      winterDistance: leftWinterDistance,
      oppositeSummerDistance: leftSummerDistance,
    },
  ].sort((a, b) => a.height - b.height);

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
    // Calculate max A and P for outside of lowest summer dyke
    const winterPlainWidth = summerBedWidth + shortSummerDyke.winterDistance + shortSummerDyke.oppositeSummerDistance;
    const lowerWinterPlainArea = summerBedArea + winterPlainWidth * summerPlainsHeight;
    const lowerWinterPlainVerticalPerimeter = 2 * summerBedDepth + 4 * summerPlainsHeight;
    const lowerWinterPlainPerimeter = lowerWinterPlainVerticalPerimeter + winterPlainWidth;
    flowAreas.push({
      type: 'lowerWinterPlain',
      maxRate: Q(lowerWinterPlainArea, lowerWinterPlainPerimeter),
    });

    // Calculate max A and P for inside of tall summer dyke (i.e. part above lower summer dyke)
    const lowerWinterPlainsHeight = tallSummerDyke.height;
    const halfWinterPlainsArea = summerBedArea + winterPlainWidth * lowerWinterPlainsHeight;
    const halfWinterPlainsVerticalPerimeter =
      2 * summerBedDepth + 2 * shortSummerDyke.height + 2 * lowerWinterPlainsHeight;
    const halfWinterPlainsPermeter = halfWinterPlainsVerticalPerimeter + winterPlainWidth;
    flowAreas.push({ type: 'middleWinterPlain', maxRate: Q(halfWinterPlainsArea, halfWinterPlainsPermeter) });

    // Calculate max A and P for outside of tall summer dyke
    const winterPlainsWidth = leftWinterDistance + summerBedWidth + rightWinterDistance;
    const winterPlainsArea = summerBedArea + lowerWinterPlainsHeight * winterPlainsWidth;
    const winterPlainsVerticalPerimeter =
      2 * summerBedDepth + 2 * leftSummerHeight + 2 * rightSummerHeight + 2 * lowerWinterPlainsHeight;
    const winterPlainsPerimeter = winterPlainsVerticalPerimeter + winterPlainsWidth;
    flowAreas.push({ type: 'secondWinterPlain', maxRate: Q(winterPlainsArea, winterPlainsPerimeter) });
  }

  // Calculate max A and P to stay within winter dykes
  const winterPlainsArea = summerBedArea + winterPlainsWidth * winterHeight;
  const winterPlainsVerticalPerimeter = 2 * summerBedDepth + 4 * summerPlainsHeight + 2 * winterHeight;
  const winterPlainsPerimeter = winterPlainsVerticalPerimeter + winterPlainsWidth;
  flowAreas.push({ type: 'upperWinterPlains', maxRate: Q(winterPlainsArea, winterPlainsPerimeter) });

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

    if (leftArea > leftWinterPlainWidth * winterHeight) {
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

  function QLowerWinterPlain(waterLevel) {
    const width = summerBedWidth + shortSummerDyke.winterDistance + shortSummerDyke.oppositeSummerDistance;
    const winterPlainWidth = shortSummerDyke.winterDistance - shortSummerDyke.summerDistance;
    const area = summerPlainsArea + winterPlainWidth * waterLevel;
    const verticalPerimeter = 2 * summerBedDepth + 2 * summerPlainsHeight + 2 * waterLevel;
    const perimeter = verticalPerimeter + width;

    return Q(area, perimeter);
  }

  function QMiddleWinterPlain(waterLevel) {
    const width = summerBedWidth + shortSummerDyke.winterDistance + shortSummerDyke.oppositeSummerDistance;
    const area = summerBedArea + width * waterLevel;
    const verticalPerimeter = 2 * summerBedDepth + 2 * summerPlainsHeight + 2 * waterLevel;
    const perimeter = verticalPerimeter + width;

    return Q(area, perimeter);
  }

  function QSecondWinterPlain(waterLevel) {
    const totalWidth = summerBedWidth + leftWinterDistance + rightWinterDistance;
    const middleWinterPlainWidth =
      summerBedWidth + shortSummerDyke.winterDistance + shortSummerDyke.oppositeSummerDistance;
    const secondWinterPlainWidth = tallSummerDyke.winterDistance - tallSummerDyke.summerDistance;

    const area = summerBedArea + middleWinterPlainWidth * tallSummerDyke.height + secondWinterPlainWidth * waterLevel;

    const verticalPerimeter =
      2 * summerBedDepth + 2 * shortSummerDyke.height + 2 * tallSummerDyke.height + 2 * waterLevel;
    const perimeter = verticalPerimeter + totalWidth;

    return Q(area, perimeter);
  }

  function QUpperWinterPlains(waterLevel) {
    if (waterLevel <= 0) return waterLevel;
    const width = summerBedWidth + leftWinterDistance + rightWinterDistance;
    const area = summerBedArea + width * waterLevel;

    const verticalPerimeter = 2 * summerBedDepth + 2 * leftSummerHeight + 2 * rightSummerHeight + 2 * waterLevel;
    const perimeter = verticalPerimeter + width;

    return Q(area, perimeter);
  }

  const waterLevels = {
    summerBed: 0,
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
      const waterLevel = solve(QSummerPlains, flowRate);
      waterLevels.summerBed = Math.min(waterLevel, summerBedDepth);
      waterLevels.summerPlains = Math.max(waterLevel - summerBedDepth, 0);
    } else {
      waterLevels.summerBed = summerBedDepth;
      waterLevels.summerPlains = summerPlainsHeight;
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
      } else if (currentlyFillingFlowArea.type === 'lowerWinterPlain') {
        waterLevels[`${shortSummerDyke.side}WinterPlain`] = solve(QLowerWinterPlain, flowRate);
      } else if (currentlyFillingFlowArea.type === 'middleWinterPlain') {
        const waterLevel = solve(QMiddleWinterPlain, flowRate);
        waterLevels[`${shortSummerDyke.side}WinterPlain`] = waterLevels.summerPlains = waterLevel;
      } else if (currentlyFillingFlowArea.type === 'secondWinterPlain') {
        waterLevels[`${shortSummerDyke.side}WinterPlain`] = waterLevels.summerPlains = tallSummerDyke.height;
        waterLevels[`${tallSummerDyke.side}WinterPlain`] = solve(QSecondWinterPlain, flowRate);
      } else if (currentlyFillingFlowArea.type === 'upperWinterPlains') {
        const waterLevel = solve(QUpperWinterPlains, flowRate);
        waterLevels.leftWinterPlain = waterLevels.middleWinterPlain = waterLevels.rightWinterPlain = waterLevels.summerPlains = waterLevel;
      }
    }
  }

  function Sky() {
    const colorClass = currentlyFillingFlowArea ? 'text-blue-300' : 'text-red-300';
    return <rect className={`${colorClass} fill-current w-full h-full`} />;
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
            ? _l(winterHeight + leftWinterDistance - distance - height / 2)
            : _l(winterHeight + leftWinterDistance + 0.5 + summerBedWidth + 0.5 + distance + height / 2)
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
        width={_s(summerPlainsWidth + 1 + leftSummerHeight / 2 + rightSummerHeight / 2)} // FIXME: Is this correct, or should it be .5lsh + .5rsh?
        x={_l(winterHeight + leftWinterDistance - leftSummerDistance - leftSummerHeight / 2)}
        y={_b(summerBedDepth + waterLevels.summerPlains)}
      />
    );
  }

  function LeftWinterPlain() {
    return (
      <rect
        className="text-blue-800 fill-current h-full"
        width={_s(winterHeight / 2 + leftWinterDistance - leftSummerDistance - leftSummerHeight / 2)}
        x={_l(winterHeight / 2)}
        y={_b(waterLevels.leftWinterPlain + summerBedDepth)}
      />
    );
  }

  function RightWinterPlain() {
    return (
      <rect
        className="text-blue-800 fill-current h-full"
        width={_s(rightWinterDistance - rightSummerDistance - rightSummerHeight / 2 + winterHeight / 2)}
        x={_l(
          winterHeight + leftWinterDistance + 0.5 + summerBedWidth + 0.5 + rightSummerDistance + rightSummerHeight / 2
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
            d={`M ${_l(winterHeight + leftWinterDistance)} ${_b(summerBedDepth)}
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
          y={_b(waterLevels.summerBed)}
        />
      </>
    );
  }

  window.q = QLowerWinterPlain;

  return (
    <div className="flow-model">
      <p>Water level: {waterLevels.summerPlains.toFixed(2)}m</p>
      <p>
        Flow Area: {flowArea.toFixed(2)}m<sup>2</sup>
      </p>
      <p>Wetted perimeter: {wettedPerimeter.toFixed(2)}m</p>
      <svg className="w-full" viewBox="0 0 1000 500">
        <Sky />
        <LeftWinterPlain />
        <SummerPlains />
        <RightWinterPlain />
        <Dyke side="left" height={winterHeight} distance={leftWinterDistance} />
        <Dyke side="left" height={leftSummerHeight} distance={leftSummerDistance} />
        <Dyke side="right" height={rightSummerHeight} distance={rightSummerDistance} />
        <Dyke side="right" height={winterHeight} distance={rightWinterDistance} />
        <Ground />
        <SummerBed />
        <line id="reference-height" x1="0" y1="950" x2="1000" y2="950" />
      </svg>
    </div>
  );
}
