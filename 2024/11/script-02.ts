import { sum } from "../util/array.ts";
import { blink } from "./part-01/lib.ts";
// import { blink } from "./lib.ts";

const parseInput = (file: string) => file.split(" ").map((i) => parseInt(i));

const TOTAL_BLINKS = 75;

type NumberMap = { [key: number]: number };
type NumbersMap = { [key: number]: number[] };

const getNumericKeys = <T extends { [key: number]: unknown }>(
  obj: T,
): number[] => {
  return Object.keys(obj).map((char) => Number(char));
};

const rocksToNumberMap = (rocks: number[]): NumberMap => {
  return rocks.reduce(
    (acc, rock) => ({ ...acc, [rock]: (acc[rock] || 0) + 1 }),
    {} as NumberMap,
  );
};

const getNewRockMap = (originRockMap: NumberMap, rockBlinkMap: NumbersMap) => {
  const nextRockMap: NumberMap = {};
  for (const originRock of getNumericKeys(originRockMap)) {
    const originRockCount = originRockMap[originRock];
    const nextRocksRockMap = rocksToNumberMap(rockBlinkMap[originRock]);
    for (const rock of getNumericKeys(nextRocksRockMap)) {
      const nextRockCount = nextRocksRockMap[rock] * originRockCount;
      nextRockMap[rock] = (nextRockMap[rock] || 0) + nextRockCount;
    }
  }
  return nextRockMap;
};

const getRockMapTotalRocks = (rockMap: NumberMap): number =>
  sum(Object.values(rockMap));

if (import.meta.main) {
  const file = Deno.readTextFileSync("./11/input.txt");
  const input = parseInput(file);
  const rockBlinkMap = {} as NumbersMap;
  let currentNumberMap = rocksToNumberMap(input);

  for (let i = 0; i < TOTAL_BLINKS; i++) {
    for (const rock of getNumericKeys(currentNumberMap)) {
      if (rockBlinkMap[rock] !== undefined) continue;

      rockBlinkMap[rock] = blink([rock]);
    }
    currentNumberMap = getNewRockMap(currentNumberMap, rockBlinkMap);
  }
  console.log({ res: getRockMapTotalRocks(currentNumberMap) });
}
