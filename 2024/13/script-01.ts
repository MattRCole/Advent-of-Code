import { addPoints, Point, scalePoint } from "../util/2d-point.ts";

const buttonRegex = /Button (?:A|B): X\+(\d+), Y\+(\d+)/;
const prizeRegex = /Prize: X=(\d+), Y=(\d+)/;

const parsePoint = (fileInfo: string, regex: RegExp): Point => {
  const match = regex.exec(fileInfo);
  if (!match) throw new Error(`Could not parse file info!! ${fileInfo}`);

  const [_, x, y] = match;

  return { x: parseInt(x), y: parseInt(y) };
};

export const parseInput = (file: string) => {
  return file.split("\n\n").map((section) => {
    const [buttonAInfo, buttonBInfo, prizeInfo] = section.split("\n");

    return {
      buttonAInfo: parsePoint(buttonAInfo, buttonRegex),
      buttonBInfo: parsePoint(buttonBInfo, buttonRegex),
      prizeInfo: parsePoint(prizeInfo, prizeRegex),
    };
  });
};

export function solveNaive(
  a: Point,
  b: Point,
  maxScalar: number,
  target: Point,
): [number, number] {
  const pastTarget = (point: Point) => point.x > target.x || point.y > target.y;
  const atTarget = (point: Point) =>
    point.x === target.x && point.y === target.y;
  const getPoint = (
    a: Point,
    aCount: number,
    b: Point,
    bCount: number,
  ): Point => {
    return addPoints(scalePoint(a, aCount), scalePoint(b, bCount));
  };

  // let bCount = 0;
  for (let aCount = maxScalar; aCount >= 0; aCount--) {
    const candidateAPoint = scalePoint(a, aCount);
    const bMaxX = (target.x - candidateAPoint.x) / b.x;
    const bMaxY = (target.y - candidateAPoint.y) / b.y;
    if (bMaxX !== bMaxY || Math.floor(bMaxX) !== bMaxX) continue;

    return [aCount, bMaxX];
    // bCount -= 1;
    // while (true) {
    //   const candidatePoint = getPoint(a, aCount, b, bCount);
    //   if (pastTarget(candidatePoint)) break;

    //   if (atTarget(candidatePoint)) return [aCount, bCount];
    //   bCount++;
    // }
  }
  return [0, 0];
}

if (import.meta.main) {
  const file = Deno.readTextFileSync("./13/input.txt");
  const input = parseInput(file);

  console.log(input[0]);
  // const { prizeInfo, buttonAInfo, buttonBInfo } = input[0];

  // const getBDiff = (a: Point, b: Point)

  let total = 0;
  for (const { buttonAInfo, buttonBInfo, prizeInfo } of input) {
    const maxAScalar = Math.floor(
      Math.min(prizeInfo.x / buttonAInfo.x, prizeInfo.y / buttonAInfo.y),
    );
    const maxBScalar = Math.floor(
      Math.min(prizeInfo.x / buttonBInfo.x, prizeInfo.y / buttonBInfo.y),
    );
    const [bCount, aCount] = solveNaive(
      buttonBInfo,
      buttonAInfo,
      maxBScalar,
      prizeInfo,
    );

    const localTotal = (aCount * 3) + bCount;
    // console.log({
    //   buttonAInfo,
    //   buttonBInfo,
    //   prizeInfo,
    //   aCount,
    //   bCount,
    //   localTotal,
    // });
    total += localTotal;
  }

  console.log({
    total,
  });
}
