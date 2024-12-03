import { multiply, sum } from "../util/array.ts";

const getValidMul = (input: string) => {
  const regex = /(mul\((?<p1>\d{1,3}),(?<p2>\d{1,3})\)).*/;

  let remainder = input;
  const muls: number[][] = [];

  while (remainder.length) {
    const result = regex.exec(remainder);
    // console.log({ result });

    if (result === null) return muls;
    const [_, fullGroup] = result;
    const groups = result.groups;
    if (groups === undefined) {
      throw new Error(`groups is undefined! remainder: "${remainder}"`);
    }

    remainder = remainder.slice(result.index + fullGroup.length);

    muls.push([parseInt(groups.p1), parseInt(groups.p2)]);
  }
  return muls;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./03/input.txt");

  const res = getValidMul(file);

  console.log({ res: sum(res.map(multiply)) });
}
