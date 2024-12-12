import { visitMap } from "../util/2dArray.ts";
import {
  at,
  get2DArray,
  getSize,
  Point,
  reduceOverNeighbors,
} from "../util/2dArray.ts";
import { sum } from "../util/array.ts";

export const parseInput = (file: string) =>
  file.split("\n").map((l) => l.split(""));

type MapOfFills = { [fillChar: string]: number };
// type BorderMap = { [point: PointKey]: Point[][] }
export type PointKey = `${number}:${number}`;

export const pointToKey = (point: Point) => `${point.x}:${point.y}` as PointKey;

export const keyToPoint = (key: PointKey): Point => {
  const [x, y] = key.split(":");
  return { x: parseInt(x), y: parseInt(y) };
};

const recursiveFlood = (
  map: string[][],
  currentPoint: Point,
  visitedPoints: Set<PointKey>,
  currentChar: string,
): { fill: Point[]; visitedPoints: Set<PointKey>; borders: number } => {
  let borders = 0;
  const size = getSize(map);
  // edges of map count as borders
  if (currentPoint.x - 1 < 0 || currentPoint.x + 1 >= size.x) borders++;
  if (currentPoint.y - 1 < 0 || currentPoint.y + 1 >= size.y) borders++;

  // console.log({ visitedPoints: [...visitedPoints.values()] });
  visitedPoints.add(pointToKey(currentPoint));
  const fill = reduceOverNeighbors(map, {
    startingPoint: currentPoint,
    initialAcc: [currentPoint] as Point[],
  }, (acc, char, neighborPoint) => {
    if (visitedPoints.has(pointToKey(neighborPoint))) return acc;
    if (char !== currentChar) {
      borders++;
      return acc;
    }

    const neighborResults = recursiveFlood(
      map,
      neighborPoint,
      new Set(visitedPoints),
      currentChar,
    );
    borders += neighborResults.borders;
    visitedPoints = visitedPoints.union(neighborResults.visitedPoints);
    return [...acc, ...neighborResults.fill];
  });

  return { fill, visitedPoints, borders };
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
    mapOfFills[key] = (mapOfFills[key] || 0) + (fill.length * borders);
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
