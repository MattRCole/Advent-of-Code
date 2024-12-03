import { multiply, sum } from "../util/array.ts";

const processMuls = (input: string) => {
  // (                     # top level group
  //  (?<fn>mul|do|don't)  # grab the name of the function (named capture group: fn)
  //    \(
  //    (?:                # helper non-capturing group start
  //      (?<p1>\d{1,3})   # grab the first argument if 1<=number of digits<=3 (named capture group: p1)
  //      ,
  //      (?<p2>\d{1,3})   # grab the second argument if 1<=number of digits<=3 (named capture group: p2)
  //    )?                 # make the inner content optional (end of non-capturing group)
  //    \)
  //  )
  //  .*

  const regex = /((?<fn>mul|do|don't)\((?:(?<p1>\d{1,3}),(?<p2>\d{1,3}))?\)).*/;

  let remainder = input;
  const muls: number[][] = [];

  let disabled = false;
  while (remainder.length) {
    const result = regex.exec(remainder);
    // console.log({ result });

    if (result === null) return muls;
    const [_, fullGroup] = result;
    const groups = result.groups;
    if (groups === undefined) {
      throw new Error(`groups is undefined! remainder: "${remainder}"`);
    }

    const noArgs = groups.p1 === undefined && groups.p2 === undefined;
    if (groups.fn === "do" && noArgs) disabled = false;

    if (groups.fn === "don't" && noArgs) disabled = true;

    remainder = remainder.slice(result.index + fullGroup.length);

    if (disabled || noArgs || groups.fn !== "mul") continue;

    muls.push([parseInt(groups.p1), parseInt(groups.p2)]);
  }
  return muls;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./03/input.txt");

  const res = processMuls(file);

  console.log({ res: sum(res.map(multiply)) });
}
