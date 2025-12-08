import { getNormalizedDirection, Point } from "../util/2d-point.ts";
import { toNumericKeys } from "../util/object.ts";
import { findCycles, getPositionAfterElapsedTime } from "./lib.ts";
import {
  getKeyFromPoint,
  getPointFromKey,
  parseInput,
  plotPoints,
  PointKey,
  renderPoints,
} from "./script-01.ts";

type Input = ReturnType<typeof parseInput>;

const renderPointsAtStepCount = (
  input: Input,
  boundaries: Point,
  count: number,
) => {
  const points = input.map(({ position, velocity }) =>
    getPositionAfterElapsedTime({
      boundaries,
      startingPosition: position,
      velocity,
      seconds: count,
    })
  );
  plotPoints(points, boundaries);
};
const doBinarySearch = (input: Input, boundaries: Point) => {
  const cycleInfo = findCycles({
    boundaries,
    startingPosition: input[0].position,
    velocity: input[0].velocity,
  });
  if (cycleInfo === undefined) throw new Error("No cycles detected.");
  if (cycleInfo.stepCountFromStartingPointToCycleStart !== 0) {
    throw new Error("We assumed a cycle starting point of 0");
  }
  const maxStepCount = cycleInfo.cycleStepCount;

  let resp: string | undefined = "";
  let currentStepCount = Math.floor(maxStepCount / 2);
  let stepSize = Math.floor(currentStepCount / 2);
  do {
    renderPointsAtStepCount(input, boundaries, currentStepCount);
    console.log({ currentStepCount });
    resp = prompt("Up, Down or Stop [u/d/S]", "s")?.toUpperCase();
    if (resp === "U") {
      currentStepCount += stepSize;
    }
    if (resp === "D") {
      currentStepCount -= stepSize;
    }
    stepSize = Math.floor(stepSize / 2);
  } while (resp !== undefined && resp !== "S");
};

const getFixedPrecisionKeyFromPoint = (point: Point): PointKey =>
  `${point.x.toFixed(3)}:${point.y.toFixed(3)}` as PointKey;

const couldBeAChristmasTree = (() => {
  const directionCache: { [k: PointKey]: PointKey } = {};
  return (points: Point[], boundaries: Point): boolean => {
    const midX = Math.floor(boundaries.x / 2);
    const dedupedPoints = [
      ...(new Set(points.map(getKeyFromPoint))).values().map(getPointFromKey),
    ];
    let left = 0;
    let right = 0;
    for (const point of points) {
      if (point.x < midX) left++;
      if (point.x > midX) right++;
    }

    // this probably isn't a christmas tree
    if (Math.abs(left - right) > 50) return false;

    const treeTop: Point = { y: 0, x: midX };

    const pointMapYX = dedupedPoints.reduce((acc, point) => {
      const currentPoint = getKeyFromPoint(point);
      if (directionCache[currentPoint] === undefined) {
        directionCache[currentPoint] = getFixedPrecisionKeyFromPoint(
          getNormalizedDirection(point, treeTop),
        );
      }
      const directionKey = directionCache[currentPoint];
      return {
        ...acc,
        [directionKey]: (acc[directionKey] || 0) + 1,
      };
    }, {} as { [dk: PointKey]: number });
    return Object.values(pointMapYX).filter((n) => n > 5).length > 2;
  };
})();

const progress = (current: number, total: number): string => {
  const prefixLen = Math.floor(Math.log10(total) + 1);
  return `${String(current).padStart(prefixLen, "0")}/${total}`;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./14/input.txt");
  const input = parseInput(file);
  const boundaries = { x: 101, y: 103 };

  // console.log(input.length);
  // doBinarySearch(input, boundaries);
  const item = input[0];
  const cycleInfo = findCycles({
    boundaries,
    startingPosition: item.position,
    velocity: item.velocity,
  });
  if (cycleInfo === undefined) throw new Error("AAAA NO CYCLE");

  const encoder = new TextEncoder();
  const interestingPoint = 10588;
  for (
    let seconds = interestingPoint;
    seconds < interestingPoint + 1;
    seconds++
  ) {
    Deno.stdout.writeSync(
      encoder.encode(`\r${progress(seconds, cycleInfo.cycleStepCount)}`),
    );
    const points = input.map(({ position, velocity }) =>
      getPositionAfterElapsedTime({
        boundaries,
        startingPosition: position,
        velocity,
        seconds,
      })
    );
    const renderedPoints = renderPoints(points, boundaries);
    Deno.writeTextFileSync(
      `./${progress(seconds, cycleInfo.cycleStepCount).split("/")[0]}.txt`,
      renderedPoints.map((l) => l.join("")).join("\n"),
    );
    // if (couldBeAChristmasTree(points, boundaries)) {
    //   console.log("");
    //   plotPoints(points, boundaries);
    //   console.log({ seconds });
    //   const res = prompt("continue? [Y/n]");
    //   if (res !== null && res !== "" && res.toUpperCase() !== "Y") break;
    // }
  }
  // console.log({ cycleInfo });
  // let nextPoints = input;
  // let i = 1;
  // while (true) {
  //   nextPoints = nextPoints.map(({ position, velocity }) => ({
  //     position: getPositionAfterElapsedTime({
  //       boundaries,
  //       seconds: 1,
  //       startingPosition: position,
  //       velocity,
  //     }),
  //     velocity,
  //   }));
  //   const points = nextPoints.map(({ position }) => position);
  //   if (couldBeATree(points, boundaries)) {
  //     console.log(i);
  //     plotPoints(points, boundaries);
  //     break;
  //   }
  //   i++;
  //   // if (i > 10) break;
  // }
}
