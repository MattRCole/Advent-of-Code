import { splice, sum } from "../util/array.ts";
import { isValidRow } from "./script-01.ts";

export const exhaustiveSearch = (row: number[]) => {
  if (isValidRow(row)) return true;

  for (let i = 0; i < row.length; i++) {
    const modifiedRow = splice(row, i, 1);
    if (isValidRow(modifiedRow)) {
      return true;
    }
  }
  return false;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./02/input.txt");
  const rows = file.split("\n").map((r) =>
    r.split(" ").filter(({ length }) => length).map((n) => parseInt(n))
  );
  const res = sum(rows.map((r) => exhaustiveSearch(r) ? 1 : 0));
  console.log({ res });
}
