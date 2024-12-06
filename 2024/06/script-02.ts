import {
  coordsToKey,
  Direction,
  DIRECTIONS,
  GuardInfo,
  ObjectMap,
  parseInput,
  walkGuard,
} from "./script-01.ts";

const keyWithDirectionToCoords = (
  key: string,
): { x: number; y: number; direction: Direction } => {
  const [xStr, yStr, direction] = key.split(":");
  return {
    x: parseInt(xStr),
    y: parseInt(yStr),
    direction: direction as Direction,
  };
};

const isCyclicPath = (
  guardInfo: GuardInfo,
  objectsXY: ObjectMap,
  objectsYX: ObjectMap,
  xBoundary: number,
  yBoundary: number,
  visitedObstacles: Set<string>,
): boolean => {
  // const visitedObstacles: Set<string> = new Set()
  let info = guardInfo;
  while (true) {
    const res = walkGuard(info, objectsXY, objectsYX, xBoundary, yBoundary);

    if (res.guardLeft) return false;

    const key = coordsToKey(
      res.obstaclePosition.x,
      res.obstaclePosition.y,
      info.facing,
    );

    if (visitedObstacles.has(key)) return true;

    visitedObstacles.add(key);
    info = res.guardInfo;
  }
};

const DIRECTION_DELTAS = {
  [Direction.North]: { i: 0, j: -1 },
  [Direction.East]: { i: 1, j: 0 },
  [Direction.South]: { i: 0, j: 1 },
  [Direction.West]: { i: -1, j: 0 },
} as const;

const keyToCoords = (
  key: string,
): { x: number; y: number } => {
  const [xStr, yStr] = key.split(":");
  return {
    x: parseInt(xStr),
    y: parseInt(yStr),
  };
};

const nextDirection = (direction: Direction) =>
  DIRECTIONS[(DIRECTIONS.indexOf(direction) + 1) % 4];

if (import.meta.main) {
  const file = Deno.readTextFileSync("./06/input.txt");
  const input = parseInput(file);
  const initialGuardX = input.guard.x;
  const initialGuardY = input.guard.y;

  const visitedObstacles: Set<string> = new Set();
  const possibleCycleObstacles: Set<string> = new Set();
  let totalPossible = 0;
  let previouslyVisitedSquares: Set<string> = new Set();

  previouslyVisitedSquares.add(coordsToKey(initialGuardX, initialGuardY));

  // const canPutObstacleAtPosition = (x: number, y: number) =>
  //   !previouslyVisitedSquares.has(coordsToKey(x, y));
  let guardLeft = false;
  let guardInfo = input.guard;
  const { objectsXY, objectsYX, xBoundary, yBoundary } = input;
  let count = 0;
  const log = (...args: unknown[]) => {
    if (count === -1) console.log(...args);
  };
  const canPutObstacleAtPosition = (x: number, y: number) =>
    !previouslyVisitedSquares.has(coordsToKey(x, y)) &&
    // (x !== initialGuardX || y !== initialGuardY) &&
    (objectsXY[x] || []).includes(y) === false;
  while (!guardLeft) {
    count += 1;
    const res = walkGuard(
      guardInfo,
      objectsXY,
      objectsYX,
      xBoundary,
      yBoundary,
    );
    const { obstaclePosition, visitedSquares } = res;

    log({ visitedObstacles, initialGuardInfo: guardInfo });

    for (const key of visitedSquares.values()) {
      const { x: currentX, y: currentY } = keyToCoords(key);
      const { i, j } = DIRECTION_DELTAS[guardInfo.facing];
      const x = currentX + i;
      const y = currentY + j;
      // if (x === guardInfo.x && y === guardInfo.y) continue;
      // log({ guardInfo: { x, y, facing: res.guardInfo.facing } });
      if (
        !canPutObstacleAtPosition(x, y)
      ) continue;
      if (
        possibleCycleObstacles.has(coordsToKey(x, y))
      ) {
        console.log(coordsToKey(x, y), count);
        totalPossible += 1;
        continue;
      }

      if (
        isCyclicPath(
          { x: currentX, y: currentY, facing: nextDirection(guardInfo.facing) },
          {
            ...objectsXY,
            [x]: [...(objectsXY[x] || []), y].toSorted((a, b) =>
              a < b ? -1 : a > b ? 1 : 0
            ),
          },
          {
            ...objectsYX,
            [y]: [...(objectsYX[y] || []), x].toSorted((a, b) =>
              a < b ? -1 : a > b ? 1 : 0
            ),
          },
          xBoundary,
          yBoundary,
          new Set([coordsToKey(x, y, guardInfo.facing)]),
        )
      ) {
        possibleCycleObstacles.add(coordsToKey(x, y));
        totalPossible += 1;
      }

      // const maybeCycleRes = walkGuard(
      //   { x, y, facing: res.guardInfo.facing },
      //   objectsXY,
      //   objectsYX,
      //   xBoundary,
      //   yBoundary,
      // );
      // log({ maybeCycleRes });

      // const obstacleKey = coordsToKey(
      //   maybeCycleRes.obstaclePosition.x,
      //   maybeCycleRes.obstaclePosition.y,
      //   res.guardInfo.facing,
      // );
      // if (
      //   maybeCycleRes.guardLeft === false && visitedObstacles.has(obstacleKey)
      // ) {
      //   const { i, j } = DIRECTION_DELTAS[guardInfo.facing];
      //   if (canPutObstacleAtPosition(x + i, y + j)) {
      //     const keyToAdd = coordsToKey(x + i, y + j);
      //     log({ i, j, keyToAdd, x, y, event: "Adding new possibility!" });

      //     possibleCycleObstacles.add(keyToAdd);
      //     totalPossible += 1;
      //   }
      // }
    }

    if (!res.guardLeft) {
      visitedObstacles.add(
        coordsToKey(obstaclePosition.x, obstaclePosition.y, guardInfo.facing),
      );
    }
    guardLeft = res.guardLeft;
    guardInfo = res.guardInfo;
    previouslyVisitedSquares = previouslyVisitedSquares.union(visitedSquares);
  }
  console.log({
    visitedObstacles: [...visitedObstacles.values()].length,
    possibleCycleObstacles: [...possibleCycleObstacles.values()].length,
    totalPossible,
  });
}
