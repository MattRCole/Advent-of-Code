import { parseInput } from "./script-01.ts";
import { Point } from "../util/2d-point.ts";
import {
  getHighPrecisionMatrix,
  getInverseOfMatrix,
  matrixMultiply,
} from "../util/high-precision-matrix.ts";
import { BigDenary } from "https://deno.land/x/bigdenary@1.0.0/mod.ts";

const solutionCheck = (
  a: Point,
  b: Point,
  aTimes: BigDenary,
  bTimes: BigDenary,
  target: Point,
): boolean => {
  const aTimesFixed = BigInt(Math.round(aTimes.valueOf()));
  const bTimesFixed = BigInt(Math.round(bTimes.valueOf()));

  if (aTimesFixed < 0n || bTimesFixed < 0n) return false;
  const resultX = (BigInt(a.x) * aTimesFixed) + BigInt(b.x) * bTimesFixed;
  const resultY = (BigInt(a.y) * aTimesFixed) + BigInt(b.y) * bTimesFixed;
  return (resultX === BigInt(target.x)) && (resultY === BigInt(target.y));
};

const matrixSolve = (a: Point, b: Point, target: Point): [number, number] => {
  const A = getHighPrecisionMatrix([
    [a.x, a.y],
    [b.x, b.y],
  ]);
  const B = getHighPrecisionMatrix([[target.x, target.y]]);

  const AInverse = getInverseOfMatrix(A);
  if (AInverse === false) return [0, 0];
  const [[aTimes, bTimes]] = matrixMultiply(B, AInverse);

  if (!solutionCheck(a, b, aTimes, bTimes, target)) {
    return [0, 0];
  }

  return [Math.round(aTimes.valueOf()), Math.round(bTimes.valueOf())];
};

const main = () => {
  const file = Deno.readTextFileSync("./13/input.txt");
  const input = parseInput(file).map((item) => ({
    ...item,
    prizeInfo: {
      x: item.prizeInfo.x + 10000000000000,
      y: item.prizeInfo.y + 10000000000000,
    },
  }));

  let total = 0;
  for (const item of input) {
    const [aCount, bCount] = matrixSolve(
      item.buttonAInfo,
      item.buttonBInfo,
      item.prizeInfo,
    );
    total += aCount * 3;
    total += bCount;
  }
  console.log("");
  console.log({ total });
};

if (import.meta.main) {
  main();
}
