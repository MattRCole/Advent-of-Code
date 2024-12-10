// import { parseInput } from "./script-01.ts";

import { getArray, splice, sum } from "../util/array.ts";

const descendingOrder = (a: number, b: number) => b - a;

const parseInput = (file: string) => {
  const fileSizeToIdMap: { [size: number]: number[] } = [];
  const freeSpaceBlocks = [] as number[];
  const fileSizes = [] as number[];

  file.split("").forEach((char, idx) => {
    const num = parseInt(char);
    // const realIndex = Math.floor(idx / 2)

    if (idx % 2 === 0) {
      const fileId = fileSizes.length;
      fileSizes.push(num);
      fileSizeToIdMap[num] = [...(fileSizeToIdMap[num] || []), fileId].toSorted(
        descendingOrder,
      );
    } else {
      freeSpaceBlocks.push(num);
    }
  });
  return { freeSpaceBlocks, fileSizeToIdMap, fileSizes };
};

const getNumericKeysWithoutUndefinedKeys = <
  T extends { [key: number]: unknown },
>(obj: T): (keyof T)[] => {
  return Object.keys(obj).map((char) => parseInt(char)).filter((key) =>
    obj[key] !== undefined
  );
};

const getLargestFileIdWithAcceptableSize = (
  targetSize: number,
  fileSizeToIdMap: { [size: number]: number[] | undefined },
): { size: number; fileId: number } => {
  const availableSizes = getNumericKeysWithoutUndefinedKeys(fileSizeToIdMap)
    .filter(
      (size) => size <= targetSize,
    );

  let maxFileId = -1;
  let maxFileIdSize = -1;
  for (const size of availableSizes) {
    const fileIds = fileSizeToIdMap[size];
    if (fileIds === undefined) continue;

    const potentialFileId = fileIds[0];
    if (potentialFileId > maxFileId) {
      maxFileId = potentialFileId;
      maxFileIdSize = size;
    }
  }

  return { size: maxFileIdSize, fileId: maxFileId };
};

const removeItem = (arr: number[], toRemove: number) =>
  splice(arr, arr.indexOf(toRemove), 1);

const organizeDiskLocations = (
  input: ReturnType<typeof parseInput>,
): number[] => {
  const fileSizeToIdMap: { [size: number]: number[] | undefined } = {
    ...input.fileSizeToIdMap,
  };
  const result = [] as number[];
  let remainingFreeSpaceInBlock = 0;
  let freeSpaceBlockIndex = -1;
  const usedFileIds: Set<number> = new Set();
  while (freeSpaceBlockIndex < input.freeSpaceBlocks.length) {
    if (remainingFreeSpaceInBlock <= 0) {
      freeSpaceBlockIndex++;
      result.push(
        ...getArray(
          input.fileSizes[freeSpaceBlockIndex],
          usedFileIds.has(freeSpaceBlockIndex) ? 0 : freeSpaceBlockIndex,
        ),
      );

      usedFileIds.add(freeSpaceBlockIndex);
      const usedSize = input.fileSizes[freeSpaceBlockIndex];
      const fileIds = fileSizeToIdMap[usedSize];
      if (fileIds !== undefined) {
        const remainingIds = removeItem(fileIds, freeSpaceBlockIndex);
        fileSizeToIdMap[usedSize] = remainingIds.length
          ? remainingIds
          : undefined;
      }

      remainingFreeSpaceInBlock = input.freeSpaceBlocks[freeSpaceBlockIndex];
    }

    const { size: usedSize, fileId: usedFileId } =
      getLargestFileIdWithAcceptableSize(
        remainingFreeSpaceInBlock,
        fileSizeToIdMap,
      );
    const fileIds = fileSizeToIdMap[usedSize];
    if (fileIds === undefined) {
      result.push(...getArray(remainingFreeSpaceInBlock, 0));
      remainingFreeSpaceInBlock = 0;
      continue;
    }

    const newGapRemainder = remainingFreeSpaceInBlock - usedSize;
    remainingFreeSpaceInBlock = newGapRemainder;
    const remainingFileIds = removeItem(fileIds, usedFileId);

    fileSizeToIdMap[usedSize] = remainingFileIds.length
      ? remainingFileIds
      : undefined;
    result.push(...getArray(usedSize, usedFileId));
    usedFileIds.add(usedFileId);
  }

  return result;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./09/input.txt");
  const input = parseInput(file);
  const rawResult = organizeDiskLocations(input);
  const result = sum(rawResult.map((fileId, idx) => fileId * idx));
  console.log({
    res: result,
  });
}
