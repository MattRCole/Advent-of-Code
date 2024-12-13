import { Point } from "./2dArray.ts";

export enum Direction {
  North = "North",
  NorthEast = "NorthEast",
  East = "East",
  SouthEast = "SouthEast",
  South = "South",
  SouthWest = "SouthWest",
  West = "West",
  NorthWest = "NorthWest",
  NoMovement = "NoMovement",
}

export const DIRECTIONS = [
  Direction.North,
  Direction.NorthEast,
  Direction.East,
  Direction.SouthEast,
  Direction.South,
  Direction.SouthWest,
  Direction.West,
  Direction.NorthWest,
] as const;

export const CARDINAL_DIRECTIONS = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West,
] as const;

export const DIAGONAL_DIRECTIONS = [
  Direction.NorthEast,
  Direction.SouthEast,
  Direction.SouthWest,
  Direction.NorthWest,
] as const;

export type CardinalDirection = (typeof CARDINAL_DIRECTIONS)[number];
export type DiagonalDirection = (typeof DIAGONAL_DIRECTIONS)[number];

export type DeltaPoint = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export const DIRECTION_DELTA_MAP: { [D in Direction]: DeltaPoint } = {
  [Direction.North]: { x: 0, y: -1 },
  [Direction.NorthEast]: { x: 1, y: -1 },
  [Direction.East]: { x: 1, y: 0 },
  [Direction.SouthEast]: { x: 1, y: 1 },
  [Direction.South]: { x: 0, y: 1 },
  [Direction.SouthWest]: { x: -1, y: 1 },
  [Direction.West]: { x: -1, y: 0 },
  [Direction.NorthWest]: { x: -1, y: -1 },
  [Direction.NoMovement]: { x: 0, y: 0 },
} as const;

export const DELTA_TO_DIRECTION_MAP = {
  0: {
    0: Direction.NoMovement,
    1: Direction.South,
    [-1]: Direction.North,
  },
  1: {
    0: Direction.East,
    1: Direction.SouthEast,
    [-1]: Direction.NorthEast,
  },
  [-1]: {
    0: Direction.West,
    1: Direction.SouthWest,
    [-1]: Direction.NorthWest,
  },
} as const;

export const getIsCardinalDirection = (
  direction: Direction,
): direction is CardinalDirection =>
  CARDINAL_DIRECTIONS.includes(direction as CardinalDirection);
export const getIsDiagonalDirection = (
  direction: Direction,
): direction is DiagonalDirection =>
  DIAGONAL_DIRECTIONS.includes(direction as DiagonalDirection);

export const travelInDirection = (
  point: Point,
  direction: Direction,
) => {
  const delta = DIRECTION_DELTA_MAP[direction];
  return { x: point.x + delta.x, y: point.y + delta.y };
};

export const areAdjacentPoints = (
  pointA: Point,
  pointB: Point,
  options?: { cardinalOnly?: boolean; diagonalOnly?: boolean },
) => {
  const {
    cardinalOnly = false,
    diagonalOnly = false,
  } = options || {};
  const xDelta = Math.abs(pointA.x - pointB.x);
  const yDelta = Math.abs(pointA.y - pointB.y);

  if (xDelta > 1 || yDelta > 1 || (xDelta === 0 && yDelta === 0)) return false;

  if (cardinalOnly && xDelta ^ yDelta) return true;
  if (diagonalOnly && !(xDelta ^ yDelta)) return true;

  return true;
};

/**
 * Returns a direction. NOTE: Will only return cardinal direction if there is ZERO difference in either the
 * X or the Y direction.
 */
export const getDirectionTraveled = (
  startingPoint: Point,
  endingPoint: Point,
): Direction => {
  const denormalizedDelta = {
    x: endingPoint.x - startingPoint.x,
    y: endingPoint.y - startingPoint.y,
  };
  const delta: DeltaPoint = {
    x: denormalizedDelta.x && (denormalizedDelta.x > 0 ? 1 : -1),
    y: denormalizedDelta.y && (denormalizedDelta.y > 0 ? 1 : -1),
  };
  return DELTA_TO_DIRECTION_MAP[delta.x][delta.y];
};
