// import { parseInput } from "./script-01.ts";

import { getArray, splice, sum } from "../util/array.ts";

const parseInput = (file: string) => {
  // const gapSizes: { [size: number]: number[] }
  const filledSizes: { [size: number]: number[] } = [];
  const hardDriveIndexes = [] as number[];
  const gaps = [] as number[];
  const filled = [] as number[];
  let hardDriveIndex = 0;
  // const

  file.split("").forEach((char, idx) => {
    const num = parseInt(char);
    // const realIndex = Math.floor(idx / 2)

    if (idx % 2 === 0) {
      const realIndex = filled.length;
      filled.push(num);
      filledSizes[num] = [...(filledSizes[num] || []), realIndex].toSorted((
        a,
        b,
      ) => b - a);
      hardDriveIndexes.push(hardDriveIndex);
    } else {
      // const realIndex = gaps.length
      gaps.push(num);
      // gapSizes[num] = [...(gapSizes[num] || []), realIndex].toSorted((a, b) => a - b)
    }
    hardDriveIndex += num;
  });
  return { gaps, filledSizes, filled, hardDriveIndexes };
};

const getNumericKeysWithoutUndefinedKeys = <
  T extends { [key: number]: unknown },
>(obj: T): (keyof T)[] => {
  return Object.keys(obj).map((char) => parseInt(char)).filter((key) =>
    obj[key] !== undefined
  );
};

const getLargestIndexAndSize = (
  target: number,
  filledSizes: { [size: number]: number[] | undefined },
): { size: number; index: number } => {
  const validSizes = getNumericKeysWithoutUndefinedKeys(filledSizes).filter(
    (size) => size <= target,
  );

  let maxId = -1;
  let sizeToUse = -1;
  for (const size of validSizes) {
    const ids = filledSizes[size];
    if (ids === undefined) continue;

    const potentialId = ids[0];
    if (potentialId > maxId) {
      maxId = potentialId;
      sizeToUse = size;
    }
  }

  return { size: sizeToUse, index: maxId };
};

const removeItem = (arr: number[], toRemove: number) =>
  splice(arr, arr.indexOf(toRemove), 1);

const fragmentInput = (
  input: {
    gaps: number[];
    filled: number[];
    filledSizes: { [size: number]: number[] };
    hardDriveIndexes: number[];
  },
): number[] => {
  const filledSizes: { [size: number]: number[] | undefined } = {
    ...input.filledSizes,
  };
  const result = [] as number[];
  let gapRemainder = 0;
  let gapIndex = -1;
  const usedNumberIndexes: Set<number> = new Set();
  while (gapIndex < input.gaps.length) {
    if (gapRemainder <= 0) {
      gapIndex++;
      result.push(
        ...getArray(
          input.filled[gapIndex],
          usedNumberIndexes.has(gapIndex) ? 0 : gapIndex,
        ),
      );

      usedNumberIndexes.add(gapIndex);
      const usedSize = input.filled[gapIndex];
      const ids = filledSizes[usedSize];
      if (ids !== undefined) {
        const remainingIds = removeItem(ids, gapIndex);
        filledSizes[usedSize] = remainingIds.length ? remainingIds : undefined;
      }

      gapRemainder = input.gaps[gapIndex];
    }

    const { size: usedSize, index: usedNumIndex } = getLargestIndexAndSize(
      gapRemainder,
      filledSizes,
    );
    const ids = filledSizes[usedSize];
    if (ids === undefined) {
      result.push(...getArray(gapRemainder, 0));
      gapRemainder = 0;
      continue;
    }

    const newGapRemainder = gapRemainder - usedSize;
    gapRemainder = newGapRemainder;
    const remainingIndexes = removeItem(ids, usedNumIndex);

    filledSizes[usedSize] = remainingIndexes.length
      ? remainingIndexes
      : undefined;
    result.push(...getArray(usedSize, usedNumIndex));
    usedNumberIndexes.add(usedNumIndex);
  }

  return result;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./09/input.txt");
  const input = parseInput(file);
  const rawResult = fragmentInput(input);
  const result = sum(rawResult.map((id, idx) => id * idx));
  console.log({
    res: result,
  });
}
