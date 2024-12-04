import { lastIndex } from "../util/array.ts";
import { boardReduce, doWordSearchAtPositionInDirection } from "./script-01.ts";

const cloneBoard = (board: string[][]) => board.map((r) => [...r]);

const parseInput = (file: string) => file.split("\n").map((l) => l.split(""));

const findMasCenterPoints = (
  board: string[][],
  direction: { i: number; j: number },
): string[] => {
  const dictionary = ["MAS"];

  return boardReduce(
    (acc, { x, y }) => {
      const res = doWordSearchAtPositionInDirection(
        cloneBoard(board),
        { x, y },
        dictionary,
        direction,
      );
      if (res.MAS > 0) {
        return [...acc, `${x + direction.i}:${y + direction.j}`];
      }
      return acc;
    },
    [] as string[],
    cloneBoard(board),
  );
};

const directions = [
  { i: 1, j: 1 },
  { i: 1, j: -1 },
  { i: -1, j: 1 },
  { i: -1, j: -1 },
] as const;

if (import.meta.main) {
  const file = Deno.readTextFileSync("./04/input.txt");
  const input = parseInput(file);

  const directionResults = directions.map((direction) =>
    findMasCenterPoints(input, direction)
  );
  const res = directionResults.reduce((acc, results, index) => {
    if (index === lastIndex(directionResults)) return acc;
    let xCount = 0;
    const toSearch = directionResults.slice(index + 1);
    for (const result of results) {
      xCount += toSearch.filter((s) => s.includes(result)).length;
    }
    return acc + xCount;
  }, 0);
  console.log({ res });
}
