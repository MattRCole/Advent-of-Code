export type Point = { x: number; y: number };

export const scalePoint = (point: Point, scalar: number): Point => {
  return { x: point.x * scalar, y: point.y * scalar };
};

export const addPoints = (a: Point, b: Point) => ({
  x: a.x + b.x,
  y: a.y + b.y,
});
