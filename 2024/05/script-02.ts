import { sum } from "../util/array.ts";
import {
  arraysAreEqual,
  getMidpointIndex,
  parseInput,
  Rules,
  sortWithRules,
} from "./script-01.ts";

const getImproperlySortedUpdates = (
  updates: number[][],
  rules: Rules,
): number[][] => {
  return updates.filter((update) =>
    !arraysAreEqual(update, sortWithRules(rules, update))
  ).map((update) => sortWithRules(rules, update));
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./05/input.txt");
  const input = parseInput(file);

  console.log({
    res: sum(
      getImproperlySortedUpdates(input.updates, input.rules).map((update) =>
        update[getMidpointIndex(update)]
      ),
    ),
  });
}
