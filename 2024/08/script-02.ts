import {
  getAllCharacterAntiNodes,
  Info,
  parseInput,
  Point,
  pointIsInNodeMap,
  pointToKey,
  sortPoints,
} from "./script-01.ts";

const pointIsOOB = (point: Point, info: Info) => {
  if (point.x < 0 || point.x >= info.xBoundary) return true;
  if (point.y < 0 || point.y >= info.yBoundary) return true;

  return false;
};

const getAllValidAntiNodes = (a: Point, b: Point, info: Info): Point[] => {
  const [leftPoint, rightPoint] = sortPoints(a, b);
  const run = rightPoint.x - leftPoint.x;
  const rise = rightPoint.y - leftPoint.y;

  const results: Point[] = [];
  let leftOOB = false;
  let rightOOB = false;
  let leftPointExt = leftPoint;
  let rightPointExt = rightPoint;
  while (!pointIsOOB(leftPointExt, info) || !pointIsOOB(rightPointExt, info)) {
    if (leftOOB || pointIsOOB(leftPointExt, info)) {
      leftOOB = true;
    } else if (!pointIsInNodeMap(leftPointExt, info.invalidSpaces)) {
      results.push(leftPointExt);
    }
    if (rightOOB || pointIsOOB(rightPointExt, info)) {
      rightOOB = true;
    } else if (!pointIsInNodeMap(rightPointExt, info.invalidSpaces)) {
      results.push(rightPointExt);
    }
    leftPointExt = { x: leftPointExt.x - run, y: leftPointExt.y - rise };
    rightPointExt = { x: rightPointExt.x + run, y: rightPointExt.y + rise };
  }
  return results;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./08/input.txt");
  const input = parseInput(file);
  const allAntiNodes: Point[] = [];
  const antinodeSet: Set<string> = new Set();
  for (const char of Object.keys(input.maps)) {
    getAllCharacterAntiNodes(input.maps[char], {
      ...input,
      invalidSpaces: {},
    }, getAllValidAntiNodes)
      .forEach((point) => {
        antinodeSet.add(pointToKey(point));
        allAntiNodes.push(point);
      });
  }

  console.log(allAntiNodes.length, antinodeSet.size);
}
