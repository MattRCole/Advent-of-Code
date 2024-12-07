import { sum } from "../util/array.ts";

type TestCase = { expectedValue: number; operands: number[] };
export type Operators = { [key: string]: (a: number, b: number) => number };

const OPERATORS: Operators = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
} as const;

export const findAllValidSolutions = (
  testCase: TestCase,
  operators = OPERATORS,
): string[][] => {
  if (testCase.operands.length === 1) {
    return testCase.operands[0] === testCase.expectedValue
      ? ([[]] as string[][])
      : ([] as string[][]);
  }

  const stack: {
    target: number;
    currentNumber: number;
    operation: string;
    usedOperations: string[];
    remainingOperands: number[];
  }[] = Object.keys(operators).map((operation) => {
    const [currentNum, ...rest] = testCase.operands;
    return {
      target: testCase.expectedValue,
      currentNumber: currentNum,
      remainingOperands: rest,
      usedOperations: [],
      operation,
    };
  });

  const results: string[][] = [];
  while (stack.length) {
    const frame = stack.pop();
    if (frame === undefined) {
      throw new Error("Are you happy now typescript????");
    }
    const {
      target,
      currentNumber,
      operation,
      usedOperations,
      remainingOperands,
    } = frame;

    const [nextNum, ...newRemainingOperands] = remainingOperands;

    const result = operators[operation](currentNumber, nextNum);
    const newUsedOperations = [...usedOperations, operation];

    if (result > target) continue;

    if (newRemainingOperands.length === 0) {
      if (result === target) results.push(newUsedOperations);

      // either way, there are no new search items to add to the stack.
      continue;
    }

    stack.push(
      ...Object.keys(operators).map((o) => ({
        target,
        currentNumber: result,
        remainingOperands: newRemainingOperands,
        usedOperations: newUsedOperations,
        operation: o,
      })),
    );
  }
  return results;
};

export const parseInput = (file: string): TestCase[] => {
  const lines = file.split("\n");

  return lines.map((l) => {
    const [expectedValueStr, operandsStr] = l.split(":").map((i) => i.trim());
    return {
      expectedValue: parseInt(expectedValueStr),
      operands: operandsStr.split(" ").map((operand) => parseInt(operand)),
    };
  });
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./07/input.txt");
  const input = parseInput(file);

  console.log({
    res: sum(
      input.filter((testCase) => {
        return findAllValidSolutions(testCase).length;
      }).map(
        (testCase) => testCase.expectedValue,
      ),
    ),
  });
}
