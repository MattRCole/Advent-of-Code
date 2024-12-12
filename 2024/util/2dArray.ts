import { getArray } from "./array.ts";

export type Point = { x: number; y: number };

export const visitNeighbors = <T>(
  map: T[][],
  options: {
    startingPoint: Point;
    includeDiagonalNeighbors?: boolean;
    includeStartingPoint?: boolean;
  },
  callback: (value: T, point: Point) => void,
) => {
  const {
    startingPoint,
    includeDiagonalNeighbors = false,
    includeStartingPoint = false,
  } = options;

  for (let y = startingPoint.y - 1; y <= startingPoint.y + 1; y++) {
    if (y >= map.length || y < 0) continue;

    const row = map[y];
    for (let x = startingPoint.x - 1; x <= startingPoint.x + 1; x++) {
      if (x >= row.length || x < 0) continue;
      if (
        includeStartingPoint === false && x === startingPoint.x &&
        y === startingPoint.y
      ) continue;
      if (
        includeDiagonalNeighbors === false && x !== startingPoint.x &&
        y !== startingPoint.y
      ) continue;

      callback(row[x], { x, y });
    }
  }
};

export const reduceOverNeighbors = <T, R>(
  map: T[][],
  options: {
    startingPoint: Point;
    initialAcc: R;
    includeDiagonalNeighbors?: boolean;
    includeStartingPoint?: boolean;
  },
  callback: (acc: R, value: T, point: Point) => R,
): R => {
  let acc = options.initialAcc;
  visitNeighbors(map, options, (value, point) => {
    acc = callback(acc, value, point);
  });
  return acc;
};

export const visitMap = <T>(
  map: T[][],
  callback: (value: T, point: Point) => void,
) => {
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      callback(row[x], { x, y });
    }
  }
};

export const reduceOverMap = <T, R>(
  map: T[][],
  initialAcc: R,
  callback: (acc: R, value: T, point: Point) => R,
): R => {
  let acc = initialAcc;
  visitMap(map, (value, point) => {
    acc = callback(acc, value, point);
  });

  return acc;
};

export const at = <T>(map: T[][], point: Point): T | undefined => {
  const row = map[point.y];
  if (row === undefined) return undefined;
  return row[point.x];
};

export const atForced = <T>(map: T[][], point: Point) => map[point.y][point.x];

export const get2DArray = <T = undefined>(size: Point, fill?: T): T[][] =>
  getArray(size.y, fill).map(() => getArray(size.x, fill));

export const shallowClone = <T>(map: T[][]): T[][] =>
  map.map((row) => [...row]);

export const getSize = (map: unknown[][]): Point => {
  if (!map.length) return { x: -1, y: -1 };

  return { y: map.length, x: map[0].length };
};
