import { Point } from "../util/2d-point.ts";
import { getArray } from "../util/array.ts";
import { getPositionAfterElapsedTime } from "./lib.ts";

// const TILE_HEIGHT = 7;
// const TILE_WIDTH = 11;
const TILE_HEIGHT = 103;
const TILE_WIDTH = 101;

export const parseInput = (
  file: string,
): ({ position: Point; velocity: Point })[] => {
  // p=0,4 v=3,-3

  const regex = /\w=(-?\d+),(-?\d+)\s+\w=(-?\d+),(-?\d+)/;
  return file.split("\n").map((l, idx) => {
    const match = regex.exec(l);
    if (match === null) {
      throw new Error(`Could not parse line #${idx + 1}! Line: ${l}`);
    }
    const [px, py, vx, vy] = match.slice(1).map((n) => parseInt(n));

    return { position: { x: px, y: py }, velocity: { x: vx, y: vy } };
  });
};

export const renderPoints = (points: Point[], boundaries: Point) => {
  const map = getArray(boundaries.y).map((_) => getArray(boundaries.x, "."));

  for (const point of points) {
    const currentVal = map[point.y][point.x];
    if (currentVal === ".") {
      map[point.y][point.x] = "1";
    } else {
      map[point.y][point.x] = `${parseInt(currentVal) + 1}`;
    }
  }

  return map;
};

export const plotPoints = (points: Point[], boundaries: Point) => {
  const map = renderPoints(points, boundaries);

  console.log(map.map((l) => l.join("")).join("\n"));
};

export const plotQuadrants = (points: Point[], boundaries: Point) => {
  const midX = Math.floor(boundaries.x / 2);
  const midY = Math.floor(boundaries.y / 2);
  const map = renderPoints(points, boundaries).map((l, y) =>
    l.map((c, x) => (x === midX || y === midY) ? " " : c)
  );

  console.log(map.map((l) => l.join("")).join("\n"));
};

export type PointKey = `${number}:${number}`;
export const getKeyFromPoint = (point: Point): PointKey =>
  `${point.x}:${point.y}`;
export const getPointFromKey = (key: PointKey): Point => {
  const [x, y] = key.split(":").map((n) => parseInt(n));
  return { x, y };
};

const calculateResult = (endingPoints: Point[], boundaries: Point) => {
  const midX = Math.floor(boundaries.x / 2);
  const midY = Math.floor(boundaries.y / 2);
  const quadrants = endingPoints.reduce((acc, { x, y }) => {
    if (x === midX || y === midY) return acc;

    const quadrantKey = getKeyFromPoint({
      x: x > midX ? 1 : 0,
      y: y > midY ? 1 : 0,
    });

    return {
      ...acc,
      [quadrantKey]: (acc[quadrantKey] || 0) + 1,
    };
  }, {} as { [k: PointKey]: number });

  return Object.values(quadrants).reduce((acc, n) => acc * n, 1);
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./14/input.txt");
  const input = parseInput(file);
  // console.log(input);
  const boundaries = { x: TILE_WIDTH, y: TILE_HEIGHT };
  const results = input.map(({ position, velocity }) =>
    getPositionAfterElapsedTime({
      boundaries,
      startingPosition: position,
      velocity,
      seconds: 100,
    })
  );
  console.log({ res: calculateResult(results, boundaries) });
  plotPoints(input.map(({ position }) => position), boundaries);
  // console.log("");
  // plotQuadrants(results, boundaries);
}
