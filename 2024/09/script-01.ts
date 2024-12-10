import { getArray, sum } from "../util/array.ts";

export const parseInput = (file: string) => {
  return file.split("").map((i) => parseInt(i)).reduce(
    (acc, val, index, { length: totalLength }) => {
      if (index % 2 === 0) {
        return {
          ...acc,
          filled: [...acc.filled, val],
        };
      }
      if (index + 1 === totalLength) return acc;

      return {
        ...acc,
        gaps: [...acc.gaps, val],
      };
    },
    { gaps: [] as number[], filled: [] as number[] },
  );
};

const fragmentInput = (
  input: { gaps: number[]; filled: number[] },
): number[] => {
  const result = [] as number[];
  let numRemainder = 0;
  let gapRemainder = 0;
  let gapIndex = -1;
  let numberIndex = input.filled.length;
  let finalNumberIndex = -1;
  let finalGapIndex = -1;
  while (true) {
    if (numRemainder <= 0) {
      if (numRemainder < 0) {
        throw new Error(
          "Num remainder can't be less than zero!!!" +
            JSON.stringify({
              numberIndex,
              gapIndex,
              numRemainder,
              gapRemainder,
            }),
        );
      }

      numberIndex--;

      if (numberIndex < 0) break;

      numRemainder = input.filled[numberIndex];
    }

    if (gapRemainder <= 0) {
      gapIndex++;
      if (gapIndex < numberIndex) {
        result.push(...getArray(input.filled[gapIndex], gapIndex));
      }
      if (gapIndex >= numberIndex) {
        finalGapIndex = gapIndex;
        finalNumberIndex = numberIndex;
        break;
      }
      gapRemainder = input.gaps[gapIndex];
    }

    const newGapRemainder = gapRemainder - numRemainder;

    let toAdd = 0;
    if (newGapRemainder < 0) {
      toAdd = gapRemainder;
      gapRemainder = 0;
      numRemainder = Math.abs(newGapRemainder);
    } else {
      toAdd = numRemainder;
      gapRemainder = newGapRemainder;
      numRemainder = 0;
    }

    result.push(...getArray(toAdd, numberIndex));
    // if (gapRemainder === 0) {
    //   result.push(...getArray(input.filled[gapIndex], gapIndex));
    // }
    // console.log({
    //   oldGapRemainder,
    //   newGapRemainder,
    //   oldNumRemainder,
    //   newNumRemainder: numRemainder,
    //   toAdd,
    //   gapIndex,
    //   numberIndex,
    //   result: result.join(""),
    // });
  }
  for (let i = finalGapIndex; i <= finalNumberIndex; i++) {
    const toAdd = i === finalGapIndex ? numRemainder : input.filled[i];
    result.push(...getArray(toAdd, i));
  }
  return result;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./09/input.txt");
  const input = parseInput(file);

  const result = fragmentInput(input);

  console.log({
    res: sum(result.map((id, idx) => id * idx)),
  });
}
