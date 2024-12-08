import { getArray, stableSort } from "../util/array.ts";

export type NodeMap = {
  [x: number]: { [y: number]: boolean };
};

export type Point = { x: number; y: number };
export type Info = {
  xBoundary: number;
  yBoundary: number;
  invalidSpaces: NodeMap;
};

export const EMPTY = "." as const;

export const sortPoints = (...points: Point[]) =>
  stableSort(
    stableSort(points, ({ y: aY }, { y: bY }) => aY - bY),
    ({ x: aX }, { x: bX }) => aX - bX,
  );

const getAllValidAntiNodes = (
  pointA: Point,
  pointB: Point,
  info: { xBoundary: number; yBoundary: number; invalidSpaces: NodeMap },
): Point[] => {
  const [leftPoint, rightPoint] = sortPoints(pointA, pointB);
  const run = rightPoint.x - leftPoint.x;
  const rise = rightPoint.y - leftPoint.y;
  // console.log({ leftPoint, rightPoint, run, rise });
  return [{ x: leftPoint.x - run, y: leftPoint.y - rise }, {
    x: rightPoint.x + run,
    y: rightPoint.y + rise,
  }].filter(({ x, y }) =>
    x >= 0 && x < info.xBoundary && y >= 0 && y < info.yBoundary &&
    pointIsInNodeMap({ x, y }, info.invalidSpaces) === false
  );
};

export const parseInput = (file: string): {
  maps: { [key: string]: NodeMap };
  xBoundary: number;
  yBoundary: number;
} => {
  const lines = file.split("\n");

  const xBoundary = lines[0].length;
  const yBoundary = lines.length;

  const maps: { [key: string]: NodeMap } = {};

  lines.forEach((l, y) =>
    l.split("").forEach((char, x) => {
      if (char === EMPTY) return;
      const characterMap = maps[char] || {} as NodeMap;
      maps[char] = {
        ...characterMap,
        [x]: { ...(characterMap[x] || {}), [y]: true },
      };
    })
  );
  return { maps, xBoundary, yBoundary };
};

export const numericKeys = <T extends { [key: number]: unknown }>(
  obj: T,
): number[] => {
  return Object.keys(obj).map((k) => parseInt(k));
};

export const pointIsInNodeMap = (point: Point, nodeMap: NodeMap): boolean =>
  (nodeMap[point.x] || {})[point.y] || false;

export const getAllCharacterAntiNodes = (
  nodeMap: NodeMap,
  info: { xBoundary: number; yBoundary: number; invalidSpaces: NodeMap },
  antiNodeFinder: (a: Point, b: Point, info: Info) => Point[] =
    getAllValidAntiNodes,
): Point[] => {
  const xVals = numericKeys(nodeMap);
  const results: Point[] = [];
  for (let i = 0; i < xVals.length; i++) {
    const currentX = xVals[i];
    const yVals = numericKeys(nodeMap[currentX]);
    for (let j = 0; j < yVals.length; j++) {
      const currentY = yVals[j];

      for (let j2 = j + 1; j2 < yVals.length; j2++) {
        results.push(
          ...nodeMapToPoints(
            pointsToNodeMap(...antiNodeFinder({ x: currentX, y: currentY }, {
              x: currentX,
              y: yVals[j2],
            }, info)),
          ),
        );
      }

      for (let i2 = i + 1; i2 < xVals.length; i2++) {
        const nextX = xVals[i2];
        const nextYVals = numericKeys(nodeMap[nextX]);
        for (let j3 = 0; j3 < nextYVals.length; j3++) {
          const nextY = nextYVals[j3];
          results.push(
            ...antiNodeFinder({ x: currentX, y: currentY }, {
              x: nextX,
              y: nextY,
            }, info),
          );
        }
      }
    }
  }
  return results;
};

export const pointToKey = (point: Point) => `${point.x}:${point.y}`;

const renderNodeMaps = (
  xBoundary: number,
  yBoundary: number,
  ...mapsToRender: { char: string; nodeMap: NodeMap }[]
): string[] => {
  const renderedMap: string[][] = getArray(yBoundary).map(() =>
    getArray(xBoundary, EMPTY)
  );

  for (const { char, nodeMap } of mapsToRender) {
    for (const x of numericKeys(nodeMap)) {
      for (const y of numericKeys(nodeMap[x])) {
        if (renderedMap[y][x] !== EMPTY) {
          console.log(
            `WARNING: OVERWRITING CHARACTER AT x: ${x}, y: ${y} from ${
              renderedMap[y][x]
            } to ${char}`,
          );
        }
        renderedMap[y][x] = char;
      }
    }
  }
  return renderedMap.map((l) => l.join(""));
};

export const pointsToNodeMap = (...points: Point[]): NodeMap => {
  const map: NodeMap = {};
  for (const { x, y } of points) {
    map[x] = { ...(map[x] || {}), [y]: true };
  }

  return map;
};

export const nodeMapToPoints = (nodeMap: NodeMap): Point[] => {
  const results: Point[] = [];
  for (const x of numericKeys(nodeMap)) {
    for (const y of numericKeys(nodeMap)) {
      results.push({ x, y });
    }
  }
  return results;
};

// const joinNodeMaps = (...nodeMaps: NodeMap[]) => {
//   const result: NodeMap = {};
//   for (const nodeMap of nodeMaps) {
//     for (const x of numericKeys(nodeMap)) {
//       for (const y of numericKeys(nodeMap[x])) {
//         result[x] = { ...(result[x] || {}), [y]: true };
//       }
//     }
//   }
//   return result;
// };

export const logNodeMaps = (
  xBoundary: number,
  yBoundary: number,
  ...mapsToLog: { char: string; nodeMap: NodeMap }[]
) => {
  console.log(renderNodeMaps(xBoundary, yBoundary, ...mapsToLog).join("\n"));
};

export const keyToPoint = (key: string): Point => {
  const [x, y] = key.split(":");
  return { x: parseInt(x), y: parseInt(y) };
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./08/input.txt");
  const input = parseInput(file);

  const antinodeSet: Set<string> = new Set();
  const allAntiNodes: Point[] = [];
  for (const char of Object.keys(input.maps)) {
    getAllCharacterAntiNodes(input.maps[char], {
      ...input,
      invalidSpaces: input.maps[char],
    })
      .forEach((point) => {
        antinodeSet.add(pointToKey(point));
        allAntiNodes.push(point);
      });
  }
  logNodeMaps(
    input.xBoundary,
    input.yBoundary,
    ...Object.keys(input.maps).map((char) => ({
      char,
      nodeMap: input.maps[char],
    })),
    {
      char: "#",
      nodeMap: pointsToNodeMap(...[...antinodeSet.values()].map(keyToPoint)),
    },
  );
  console.log(antinodeSet.size, allAntiNodes.length);
}
