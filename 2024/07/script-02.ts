import { sum } from "../util/array.ts";
import { findAllValidSolutions, Operators, parseInput } from "./script-01.ts";

const OPERATORS: Operators = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
  concat: (a, b) => parseInt(`${a}${b}`),
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./07/input.txt");
  const input = parseInput(file);

  console.log({
    res: sum(
      input.filter((testCase) =>
        findAllValidSolutions(testCase, OPERATORS).length
      ).map(({ expectedValue }) => expectedValue),
    ),
  });
}
