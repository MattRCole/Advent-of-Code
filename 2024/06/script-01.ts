import { getArray } from "../util/array.ts";

export enum Direction {
  North = "north",
  East = "east",
  West = "west",
  South = "south",
}

export const EMPTY = "." as const;
export const OBSTACLE = "#" as const;
export const DIRECTIONS = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West,
] as const;
export const DIRECTION_MAP = {
  "^": Direction.North,
  ">": Direction.East,
  "v": Direction.South,
  "<": Direction.West,
} as const;
export const REVERSE_DIRECTIONS_MAP = {
  [Direction.North]: "^",
  [Direction.East]: ">",
  [Direction.South]: "v",
  [Direction.West]: "<",
} as const;

export type ObjectMap = { [key: number]: number[] };
export type GuardInfo = { x: number; y: number; facing: Direction };
export type GuardDirection = keyof (typeof DIRECTION_MAP);

const isValidGuardDirection = (
  direction: string,
): direction is GuardDirection =>
  Object.keys(DIRECTION_MAP).includes(direction);

export const parseInput = (
  file: string,
): {
  objectsYX: ObjectMap;
  objectsXY: ObjectMap;
  guard: GuardInfo;
  xBoundary: number;
  yBoundary: number;
} => {
  const objectsYX: ObjectMap = {};
  const objectsXY: ObjectMap = {};
  let guardInfo: GuardInfo | undefined = undefined;
  file.split("\n").forEach((l, y) => {
    l.split("").forEach((char, x) => {
      if (char === EMPTY) return;

      if (char === OBSTACLE) {
        objectsYX[y] = [...(objectsYX[y] || []), x].toSorted((a, b) =>
          a < b ? -1 : a > b ? 1 : 0
        );
        objectsXY[x] = [...(objectsXY[x] || []), y].toSorted((a, b) =>
          a < b ? -1 : a > b ? 1 : 0
        );
        return;
      }

      if (isValidGuardDirection(char) === false) {
        throw new Error(
          `Unknown character at ${JSON.stringify({ x, y })}: ${char}`,
        );
      }

      if (guardInfo !== undefined) {
        throw new Error(`Duplicate guard info!!!! ${guardInfo}, ${({ x, y })}`);
      }
      guardInfo = {
        x,
        y,
        facing: DIRECTION_MAP[char],
      };
    });
  });

  if (guardInfo === undefined) throw new Error("No guard info found!!!!");

  return {
    guard: guardInfo,
    objectsXY,
    objectsYX,
    yBoundary: file.split("\n").length,
    xBoundary: file.split("\n")[0].split("").length,
  };
};

export const coordsToKey = (x: number, y: number, direction?: Direction) =>
  `${x}:${y}${direction ? `:${direction}` : ""}`;

export const walkGuard = (
  guardInfo: GuardInfo,
  objectsXY: ObjectMap,
  objectsYX: ObjectMap,
  xBoundary: number,
  yBoundary: number,
): {
  guardInfo: GuardInfo;
  visitedSquares: Set<string>;
  guardLeft: boolean;
  obstaclePosition: { x: number; y: number };
} => {
  const {
    x: guardStartingX,
    y: guardStartingY,
    facing,
  } = guardInfo;

  const visitedSquares: Set<string> = new Set();
  const isNorthSouth = [Direction.North, Direction.South].includes(facing);
  const isNorthOrWest = [Direction.North, Direction.West].includes(facing);
  const objects = isNorthSouth ? objectsXY : objectsYX;
  const firstStartingKey = isNorthSouth ? guardStartingX : guardStartingY;
  const secondStartingKey = isNorthSouth ? guardStartingY : guardStartingX;
  const delta = isNorthOrWest ? -1 : 1;

  const getNextObstacleIndex = (arr: number[]) => {
    if (arr === undefined) return -1;
    const filtered = arr.filter((num) =>
      isNorthOrWest ? num < secondStartingKey : num > secondStartingKey
    );
    // console.log({ filtered, arr, secondStartingKey });
    if (filtered.length === 0) return -1;

    const ranIntoObjectAt = filtered.at(isNorthOrWest ? -1 : 0);

    return ranIntoObjectAt as number;
  };
  const obstacleSecondKey = getNextObstacleIndex(objects[firstStartingKey]);
  if (obstacleSecondKey === -1) {
    // guard is going to leave the map no matter what
    const boundary = isNorthSouth ? yBoundary : xBoundary;
    for (
      let idx = secondStartingKey;
      idx >= 0 && idx < boundary;
      idx += delta
    ) {
      const x = isNorthSouth ? firstStartingKey : idx;
      const y = isNorthSouth ? idx : firstStartingKey;
      visitedSquares.add(coordsToKey(x, y));
    }
    return {
      guardInfo: {
        x: -1,
        y: -1,
        facing: DIRECTIONS[(DIRECTIONS.indexOf(facing) + 1) % 4],
      },
      guardLeft: true,
      visitedSquares,
      obstaclePosition: {
        x: -1,
        y: -1,
      },
    };
  }

  const newGuardInfo: GuardInfo = {
    facing: DIRECTIONS[(DIRECTIONS.indexOf(facing) + 1) % 4],
    x: guardStartingX,
    y: guardStartingY,
  };
  for (let idx = secondStartingKey; idx !== obstacleSecondKey; idx += delta) {
    if (idx === obstacleSecondKey) break;
    const x = isNorthSouth ? firstStartingKey : idx;
    const y = isNorthSouth ? idx : firstStartingKey;
    // console.log({ x, y, idx, obstacleSecondKey });
    newGuardInfo.x = x;
    newGuardInfo.y = y;
    if (idx !== secondStartingKey) visitedSquares.add(coordsToKey(x, y));
    visitedSquares.add(coordsToKey(x, y));
  }
  return {
    guardLeft: false,
    guardInfo: newGuardInfo,
    visitedSquares,
    obstaclePosition: {
      x: isNorthSouth ? firstStartingKey : obstacleSecondKey,
      y: isNorthSouth ? obstacleSecondKey : firstStartingKey,
    },
  };
};

const logInfo = (
  guardInfo: GuardInfo,
  objectsYX: ObjectMap,
  visitedSquares: Set<string>,
  xBoundary: number,
  yBoundary: number,
) => {
  const map = getArray(yBoundary).map(() => getArray(xBoundary, "."));
  for (let y = 0; y < yBoundary; y++) {
    for (let x = 0; x < xBoundary; x++) {
      if (objectsYX[y] && objectsYX[y].includes(x)) {
        map[y][x] = OBSTACLE;
      }
      if (visitedSquares.has(coordsToKey(x, y))) {
        if (map[y][x] === OBSTACLE) {
          console.log(
            `Warning: Guard has walked over obstacle at ${
              JSON.stringify({ x, y })
            }`,
          );
        }
        map[y][x] = "X";
      }
      if (x === guardInfo.x && y === guardInfo.y) {
        if (map[y][x] === OBSTACLE) {
          console.log(
            `Warning: Guard has overlapped obstacle at ${
              JSON.stringify({ x, y })
            }`,
          );
        }
        map[y][x] = REVERSE_DIRECTIONS_MAP[guardInfo.facing];
      }
    }
  }

  console.log(map.map((row) => row.join("")).join("\n"));
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./06/input.txt");
  const input = parseInput(file);

  let guardLeft = false;
  let visitedSquares: Set<string> = new Set();
  visitedSquares.add(coordsToKey(input.guard.x, input.guard.y));
  let count = 0;
  let guardInfo = input.guard;
  const encoder = new TextEncoder();

  while (!guardLeft) {
    count += 1;
    await Deno.stdout.write(
      encoder.encode(
        `\r${String(count).padStart(10, "0")}\t${visitedSquares.size}`,
      ),
    );
    const res = walkGuard(
      guardInfo,
      input.objectsXY,
      input.objectsYX,
      input.xBoundary,
      input.yBoundary,
    );
    guardLeft = res.guardLeft;
    guardInfo = res.guardInfo;
    const newVisitedSquares = visitedSquares.union(res.visitedSquares);
    // if (newVisitedSquares.size === 280) {
    //   console.log("");
    //   console.log(guardInfo);
    //   break;
    // }
    visitedSquares = newVisitedSquares;
    // logInfo(
    //   guardInfo,
    //   input.objectsYX,
    //   newVisitedSquares,
    //   input.xBoundary,
    //   input.yBoundary,
    // );
  }
  console.log("\n", {
    count,
    uniqueVisitedSquares: [...visitedSquares.values()].length,
  });
}
