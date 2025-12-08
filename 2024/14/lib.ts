import { addPoints, Point } from "../util/2d-point.ts";
import { getKeyFromPoint, PointKey } from "./script-01.ts";

const normalizePoint = (boundaries: Point, point: Point): Point => {
  const x = point.x < 0
    ? boundaries.x + point.x
    : point.x >= boundaries.x
    ? point.x % boundaries.x
    : point.x;
  const y = point.y < 0
    ? boundaries.y + point.y
    : point.y >= boundaries.y
    ? point.y % boundaries.y
    : point.y;
  return { x, y };
};

export const getPositionAfterElapsedTime = (
  args: {
    boundaries: Point;
    startingPosition: Point;
    velocity: Point;
    seconds: number;
  },
): Point => {
  const {
    boundaries,
    startingPosition,
    velocity,
    seconds,
  } = args;
  let travelTime = 0;
  let currentPosition = { ...startingPosition };
  while (travelTime < seconds) {
    currentPosition = normalizePoint(
      boundaries,
      addPoints(currentPosition, velocity),
    );
    travelTime++;
  }
  return currentPosition;
};

export type CycleInfo = {
  startingPosition: Point;
  cycleStartingPosition: Point;
  stepCountFromStartingPointToCycleStart: number;
  cycleStepCount: number;
};

export const findCycles = (
  args: {
    boundaries: Point;
    startingPosition: Point;
    velocity: Point;
    maxStepCount?: number;
  },
): CycleInfo | undefined => {
  const {
    boundaries,
    startingPosition,
    velocity,
    maxStepCount = Number.MAX_SAFE_INTEGER,
  } = args;
  let stepCount = 0;
  const visitedSpaces: { [key: PointKey]: number } = {
    [getKeyFromPoint(startingPosition)]: stepCount,
  };

  let currentPoint: Point = { ...startingPosition };

  while (stepCount < maxStepCount) {
    currentPoint = normalizePoint(
      boundaries,
      addPoints(currentPoint, velocity),
    );
    stepCount++;
    const currentKey = getKeyFromPoint(currentPoint);
    if (visitedSpaces[currentKey] === undefined) {
      visitedSpaces[currentKey] = stepCount;
      continue;
    }

    return {
      cycleStartingPosition: currentPoint,
      cycleStepCount: stepCount - visitedSpaces[currentKey],
      stepCountFromStartingPointToCycleStart: visitedSpaces[currentKey],
      startingPosition,
    };
  }
};
