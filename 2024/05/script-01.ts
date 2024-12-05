import { lastIndex, stableSort, sum } from "../util/array.ts";

export type Rules = { [key: number]: number[] };

export const parseInput = (
  file: string,
): { rules: Rules; updates: number[][] } => {
  const [rulesUnparsed, updatesUnparsed] = file.split("\n\n");

  const rules = rulesUnparsed.split("\n").reduce((acc: Rules, str) => {
    const [before, after] = str.split("|").map((n) => parseInt(n));

    return { ...acc, [before]: [...(acc[before] || []), after] };
  }, {});

  return {
    rules,
    updates: updatesUnparsed.split("\n").map((line) =>
      line.split(",").map((n) => parseInt(n))
    ),
  };
};

export const sortWithRules = (rules: Rules, update: number[]): number[] => {
  return stableSort(update, (a, b) => {
    if (rules[a] && rules[a].includes(b)) return -1;
    if (rules[b] && rules[b].includes(a)) return 1;

    return 0;
  });
};

export const arraysAreEqual = (a: number[], b: number[]): boolean =>
  a.join(":") === b.join(":");

const getProperlySortedUpdates = (
  updates: number[][],
  rules: Rules,
): number[][] => {
  return updates.filter((update) => {
    return arraysAreEqual(update, sortWithRules(rules, update));
  });
};

export const getMidpointIndex = (arr: unknown[]) =>
  Math.floor(lastIndex(arr) / 2);

if (import.meta.main) {
  const file = Deno.readTextFileSync("./05/input.txt");
  const input = parseInput(file);

  const properUpdates = getProperlySortedUpdates(input.updates, input.rules);

  console.log({
    res: sum(properUpdates.map((update) => update[getMidpointIndex(update)])),
  });
}
