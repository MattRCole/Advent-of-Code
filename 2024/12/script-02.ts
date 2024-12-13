import { visitMap } from "../util/2dArray.ts";
import {
  at,
  get2DArray,
  getSize,
  Point,
  reduceOverNeighbors,
} from "../util/2dArray.ts";
import { enumerate, last, sum } from "../util/array.ts";
import {
  CARDINAL_DIRECTIONS,
  CardinalDirection,
  Direction,
  getDirectionTraveled,
  getIsCardinalDirection,
  travelInDirection,
} from "../util/grid.ts";
import { getAtPathWithDefault } from "../util/object.ts";
import { keyToPoint, parseInput, PointKey, pointToKey } from "./script-01.ts";

type PointDirectionKey = `${number}:${number}:${CardinalDirection}`;

const pointAndDirectionToKey = (point: Point, direction: Direction) =>
  `${point.x}:${point.y}:${direction}` as PointDirectionKey;

type BorderMap = { [point: PointKey]: Point[] };

const combineBorderMaps = (mapA: BorderMap, mapB: BorderMap): BorderMap =>
  (Object.keys(mapB) as PointKey[])
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: [...(acc[key] || []), ...mapB[key]],
      }),
      mapA,
    );

const recursiveFlood = (
  map: string[][],
  currentPoint: Point,
  visitedPoints: Set<PointKey>,
  currentChar: string,
): {
  fill: Point[];
  visitedPoints: Set<PointKey>;
  borders: BorderMap;
} => {
  const currentBorders = [] as Point[];
  let neighborBorders: BorderMap = {};
  const size = getSize(map);
  // edges of map count as borders
  if (currentPoint.x - 1 < 0) {
    currentBorders.push({ x: currentPoint.x - 1, y: currentPoint.y });
  } else if (currentPoint.x + 1 >= size.x) {
    currentBorders.push({ ...currentPoint, x: currentPoint.x + 1 });
  }
  if (currentPoint.y - 1 < 0) {
    currentBorders.push({ ...currentPoint, y: currentPoint.y - 1 });
  } else if (currentPoint.y + 1 >= size.y) {
    currentBorders.push({ ...currentPoint, y: currentPoint.y + 1 });
  }

  // console.log({ visitedPoints: [...visitedPoints.values()] });
  visitedPoints.add(pointToKey(currentPoint));
  const fill = reduceOverNeighbors(map, {
    startingPoint: currentPoint,
    initialAcc: [currentPoint] as Point[],
  }, (acc, char, neighborPoint) => {
    if (visitedPoints.has(pointToKey(neighborPoint))) return acc;
    if (char !== currentChar) {
      currentBorders.push(neighborPoint);
      return acc;
    }

    const neighborResults = recursiveFlood(
      map,
      neighborPoint,
      new Set(visitedPoints),
      currentChar,
    );

    neighborBorders = combineBorderMaps(
      neighborBorders,
      neighborResults.borders,
    );
    visitedPoints = visitedPoints.union(neighborResults.visitedPoints);
    return [...acc, ...neighborResults.fill];
  });

  return {
    fill,
    visitedPoints,
    borders: currentBorders.length
      ? combineBorderMaps(neighborBorders, {
        [pointToKey(currentPoint)]: currentBorders,
      })
      : neighborBorders,
  };
};

const areNeighborPoints = (pointA: Point, pointB: Point): boolean => {
  return Math.abs(pointA.x - pointB.x) === 1 || Math.abs(pointA.y - 1) === 1;
};

const pointsAreEqual = (pointA: Point, pointB: Point) =>
  pointA.x === pointB.x && pointA.y === pointB.y;

const getNumericKeys = (obj: { [key: number]: unknown }): number[] =>
  Object.keys(obj).map((k) => parseInt(k));

const getEdgeCount = (borderMap: BorderMap): number => {
  type DirectedPoint = Point & { direction: CardinalDirection };
  const wallMap: { [C in CardinalDirection]?: { [xOrY: number]: number[] } } =
    {};
  for (const pointKey of Object.keys(borderMap) as PointKey[]) {
    const interiorPoint = keyToPoint(pointKey);
    for (const outerPoint of borderMap[pointKey]) {
      const direction = getDirectionTraveled(interiorPoint, outerPoint);
      if (getIsCardinalDirection(direction) === false) {
        throw new Error(
          `Did not travel in cardinal direction! interiorPoint = ${
            JSON.stringify(interiorPoint)
          }, outerPoint: ${JSON.stringify(outerPoint)}`,
        );
      }

      const isNorthSouth = [Direction.North, Direction.South].includes(
        direction,
      );
      const firstKey = isNorthSouth ? interiorPoint.y : interiorPoint.x;
      const secondKey = isNorthSouth ? interiorPoint.x : interiorPoint.y;
      const existingSecondKeys = getAtPathWithDefault(wallMap, [
        direction,
        firstKey,
      ], [] as number[]);
      const numMap = {
        ...(wallMap[direction] || {}),
        [firstKey]: [...existingSecondKeys, secondKey],
      };
      wallMap[direction] = numMap;
    }
  }
  const maybeConsecutiveNumberArrays = Object.values(wallMap).map((o) =>
    Object.values(o)
  ).flat(1);
  let edgeCount = 0;
  for (const maybeConsecutiveNumbers of maybeConsecutiveNumberArrays) {
    const sorted = maybeConsecutiveNumbers.toSorted((a, b) => a - b);
    sorted.forEach((num, idx) => {
      if (idx === 0) {
        edgeCount++;
        return;
      }
      if (num - 1 !== sorted[idx - 1]) edgeCount++;
    });
  }
  return edgeCount;
};

const handleFloodFill = (input: string[][]) => {
  const inputSize = getSize(input);
  const hasBeenVisited = get2DArray(inputSize, false);
  let runningTotal = 0;
  // const mapOfFills = {} as MapOfFills;

  visitMap(input, (key, point) => {
    if (at(hasBeenVisited, point)) return;

    const { fill, visitedPoints, borders } = recursiveFlood(
      input,
      point,
      new Set(),
      key,
    );
    const edgeCount = getEdgeCount(borders);
    runningTotal += fill.length * edgeCount;
    // mapOfFills[key] = (mapOfFills[key] || 0) +
    //   (fill.length * Object.values(borders).flat(1).length);
    for (const pointKey of visitedPoints.values()) {
      const { x, y } = keyToPoint(pointKey);
      hasBeenVisited[y][x] = true;
    }
  });
  return runningTotal;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./12/input.txt");
  const input = parseInput(file);
  const res = handleFloodFill(input);
  console.log({ res: res });
}
