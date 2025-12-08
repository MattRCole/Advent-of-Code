export type Point = { x: number; y: number };

export const scalePoint = (point: Point, scalar: number): Point => {
  return { x: point.x * scalar, y: point.y * scalar };
};

export const addPoints = (a: Point, b: Point) => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const lengthOfVector = (v: Point): number => {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
};

export const getDirection = (start: Point, end: Point): Point => ({
  x: end.x - start.x,
  y: end.y - start.y,
});

export const getNormalizedDirection = (start: Point, end: Point) => {
  const direction = getDirection(start, end);
  const len = lengthOfVector(direction);
  return {
    x: direction.x / len,
    y: direction.y / len,
  } as Point;
};
