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
  travelInDirection,
} from "../util/grid.ts";
import { keyToPoint, parseInput, PointKey, pointToKey } from "./script-01.ts";

type PointDirectionKey = `${number}:${number}:${CardinalDirection}`;

const pointAndDirectionToKey = (point: Point, direction: Direction) =>
  `${point.x}:${point.y}:${direction}` as PointDirectionKey;

type BorderMap = { [point: PointKey]: Point[] };

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
    neighborBorders = { ...neighborBorders, ...neighborResults.borders };
    visitedPoints = visitedPoints.union(neighborResults.visitedPoints);
    return [...acc, ...neighborResults.fill];
  });

  return {
    fill,
    visitedPoints,
    borders: { ...neighborBorders, [pointToKey(currentPoint)]: currentBorders },
  };
};

const areNeighborPoints = (pointA: Point, pointB: Point): boolean => {
  return Math.abs(pointA.x - pointB.x) === 1 || Math.abs(pointA.y - 1) === 1;
};

const pointsAreEqual = (pointA: Point, pointB: Point) =>
  pointA.x === pointB.x && pointA.y === pointB.y;

const getNumericKeys = (obj: { [key: number]: unknown }): number[] =>
  Object.keys(obj).map((k) => parseInt(k));

const getEdgeCount = (borderMap: BorderMap) => {
  // we want to walk every perimeter of the shape.
  // The shape can have more than 1 perimeter
  // How do we know if we've gotten them all?
  // - Every outer adjacent space has been visited at least once
  // - Every internal adjacent space has been visited at least once
  const allInnerBorderSpaces = new Set(Object.keys(borderMap) as PointKey[]);
  const allOuterBorderSpaces = new Set(
    Object.values(borderMap).flat(1).map(pointToKey),
  );
  const visitedBoarderSpaces: Set<PointDirectionKey> = new Set();
  const visitedInternalSpaces: Set<PointDirectionKey> = new Set();
  const findFirstAdjacentUnvisitedWall = (
    outerKey: PointKey,
  ): CardinalDirection => {
    const outerPoint = keyToPoint(outerKey);
    for (const direction of CARDINAL_DIRECTIONS) {
      const maybeValidInnerPointKey = pointToKey(
        travelInDirection(outerPoint, direction),
      );
      if (
        allInnerBorderSpaces.has(maybeValidInnerPointKey) &&
        !visitedInternalSpaces.has(`${maybeValidInnerPointKey}:${direction}`)
      ) return direction;
    }
    throw new Error(
      `Trying to find a valid direction for ${outerKey}, but can't!!!! inner: ${
        [...allInnerBorderSpaces.values()].join(" ")
      }`,
    );
  };

  type SparseMap = { [key: number]: number[] };
  const yxSparseMap: SparseMap = {};
  const xySparseMap: SparseMap = {};
  for (const pointKey of Object.keys(borderMap)) {
    const { x, y } = keyToPoint(pointKey as PointKey);
    yxSparseMap[y] = [...(yxSparseMap[y] || []), x];
    xySparseMap[x] = [...(xySparseMap[x] || []), y];
  }
  for (const y of getNumericKeys(yxSparseMap)) {
    const sortedX = yxSparseMap[y].toSorted((a, b) => a - b);
    const { edgeCount } = sortedX.reduce(
      (acc: { edgeCount: number; prevPoints: Point[] }, x, idx) => {
        const currentPoint = { x, y };
        if (acc.prevPoints.length === 0) {
          if (idx + 1 === sortedX.length) {
            return { ...acc, edgeCount: acc.edgeCount + 1 };
          }

          return { ...acc, prevPoints: [{ x, y }] };
        }
        if (x - 1 !== last(acc.prevPoints).x) {
          let edgeCount = 0;
          let currentBorders: Point[] = [];
          for (const [index, point] of enumerate(acc.prevPoints)) {
            const prevBoarders = currentBorders;
            currentBorders = borderMap[pointToKey(point)].filter((
              { y: borderY },
            ) => borderY !== y);
            if (index === 0) {
              edgeCount += currentBorders.length;
              continue;
            }
            if (prevBoarders.length === 2) {
              // not a whole lot to do, we are or were on a peninsula, the number of edges is not going to go up
              continue;
            }
            if (currentBorders.length === 2) {
              // we know that we didn't used to have 2 boarders, so we've entered a peninsula. We know that we gained a new edge no matter what.
              edgeCount++;
              continue;
            }
            // this is where it gets interesting. Just cuz we have two boarders, they could be facing different directions
            const [{ y: prevY }] = prevBoarders;
            const [{ y: currentY }] = currentBorders;

            // the way the edges are "facing" is different. so we know that its a new edge
            if (prevY !== currentY) edgeCount++;
          }
          return {
            edgeCount: acc.edgeCount + edgeCount,
            prevPoints: [currentPoint],
          };
        }

        return { ...acc, edgeCount: [...acc.prevPoints, currentPoint] };
      },
      { edgeCount: 0, prevPoints: [] } as {
        edgeCount: number;
        prevPoints: Point[];
      },
    );
  }
};

const handleFloodFill = (input: string[][]) => {
  const inputSize = getSize(input);
  const hasBeenVisited = get2DArray(inputSize, false);
  const mapOfFills = {} as MapOfFills;

  visitMap(input, (key, point) => {
    if (at(hasBeenVisited, point)) return;

    const { fill, visitedPoints, borders } = recursiveFlood(
      input,
      point,
      new Set(),
      key,
    );
    mapOfFills[key] = (mapOfFills[key] || 0) +
      (fill.length * Object.values(borders).flat(1).length);
    for (const pointKey of visitedPoints.values()) {
      const { x, y } = keyToPoint(pointKey);
      hasBeenVisited[y][x] = true;
    }
  });
  return mapOfFills;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./12/input.txt");
  const input = parseInput(file);
  const res = handleFloodFill(input);
  console.log({ res: sum(Object.values(res)) });
  // const { visitedPoints, fill, borders } = recursiveFlood(
  //   input,
  //   { x: 0, y: 0 },
  //   new Set(),
  //   input[0][0],
  // );
  // console.log({ fill, visitedPoints: [...visitedPoints.values()], borders });
}
