import { sum } from "../util/array.ts";

export const parseInput = (file: string) => {
  return file.split("\n").map((l) =>
    l.split(" ").filter((c) => c.trim() !== "").map((i) => parseInt(i))
  );
};

export const sortLists = (input: number[][]): [number[], number[]] => {
  const [left, right] = input.reduce(([left, right], [leftNum, rightNum]) => {
    return [[...left, leftNum], [...right, rightNum]];
  }, [[], []] as number[][]);

  return [left.toSorted(), right.toSorted()];
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./01/input.txt");

  const input = parseInput(file);

  const [left, right] = sortLists(input);

  const res = sum(
    left.map((leftNum, index) => Math.abs(leftNum - right[index])),
  );
  console.log({ res });
}
