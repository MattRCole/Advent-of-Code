import { lastIndex } from "../util/array.ts";

type VisitNeighborsReducer<T> = (
  acc: T,
  info: { x: number; y: number; value: string },
) => T;

export const visitNeighbors = <T>(
  x: number,
  y: number,
  reducer: VisitNeighborsReducer<T>,
  initialAcc: T,
  board: string[][],
): T => {
  const startingX = x <= 0 ? 0 : x - 1;
  const startingY = y <= 0 ? 0 : y - 1;

  let acc: T = initialAcc;
  for (let j = startingY; j <= Math.min(y + 1, lastIndex(board)); j++) {
    const row = board[j];
    for (let i = startingX; i <= Math.min(x + 1, lastIndex(row)); i++) {
      if (i === x && y === j) continue;

      acc = reducer(acc, { x: i, y: j, value: row[i] });
    }
  }
  return acc;
};

export const boardReduce = <T>(
  reducer: (acc: T, info: { x: number; y: number; value: string }) => T,
  initialAcc: T,
  board: string[][],
): T => {
  let acc = initialAcc;

  for (let j = 0; j < board.length; j++) {
    const row = board[j];
    for (let i = 0; i < row.length; i++) {
      acc = reducer(acc, { x: i, y: j, value: row[i] });
    }
  }
  return acc;
};

export const doWordSearchAtPositionInDirection = (
  board: string[][],
  startingPoint: { x: number; y: number },
  dictionary: string[],
  direction: { i: number; j: number },
): { [key: string]: number } => {
  type StackItem = {
    wordSoFar: string;
    visitedPoints: ({ x: number; y: number })[];
    currentPoint: { x: number; y: number };
    potentialWords: string[];
  };
  const searchStack: StackItem[] = [
    {
      wordSoFar: board[startingPoint.y][startingPoint.x],
      currentPoint: { ...startingPoint },
      visitedPoints: [{ ...startingPoint }],
      potentialWords: [...dictionary],
    },
  ];

  const results: { [key: string]: number } = {};
  while (searchStack.length) {
    const searchItem = searchStack.pop();
    if (searchItem === undefined) {
      throw new Error("THis is literally impossible");
    }

    const {
      wordSoFar,
      currentPoint,
      visitedPoints,
      potentialWords,
    } = searchItem;

    const neighborReducer: VisitNeighborsReducer<
      { stackItems: StackItem[]; foundWords: string[] }
    > = (acc, { x, y, value }) => {
      // only go in the correct direction
      if (
        currentPoint.x + direction.i !== x ||
        currentPoint.y + direction.j !== y
      ) {
        return acc;
      }

      const continuedWords = potentialWords.filter((word) =>
        word.startsWith(wordSoFar + value)
      );

      const completedWords = continuedWords.filter((word) =>
        word === wordSoFar + value
      );

      const remainingWords = continuedWords.filter((word) =>
        !completedWords.includes(word)
      );

      if (continuedWords.length === 0) return acc;

      if (remainingWords.length === 0) {
        return {
          stackItems: acc.stackItems,
          foundWords: [...acc.foundWords, ...completedWords],
        };
      }
      return {
        stackItems: [...acc.stackItems, {
          currentPoint: { x, y },
          visitedPoints: [...visitedPoints, { x, y }],
          potentialWords: remainingWords,
          wordSoFar: wordSoFar + value,
        }],
        foundWords: [...acc.foundWords, ...completedWords],
      };
    };

    const { stackItems, foundWords } = visitNeighbors(
      currentPoint.x,
      currentPoint.y,
      neighborReducer,
      { stackItems: [], foundWords: [] },
      board.map((r) => [...r]),
    );
    searchStack.push(...stackItems);
    foundWords.forEach((word) => {
      results[word] = (results[word] || 0) + 1;
    });
  }

  return results;
};

const directions = [
  // { i: 0, j: 0 }, invalid direction
  { i: 0, j: 1 },
  { i: 1, j: 0 },
  { i: 1, j: 1 },

  { i: 0, j: -1 },
  { i: -1, j: 0 },
  { i: -1, j: -1 },

  { i: 1, j: -1 },
  { i: -1, j: 1 },
] as const;

type SearchResult = { [word: string]: number };

const mergeResults = (a: SearchResult, b: SearchResult): SearchResult =>
  Object.keys(a).reduce(
    (acc, word) => ({ ...acc, [word]: (acc[word] || 0) + a[word] }),
    b,
  );

const parseInput = (file: string) =>
  file.split("\n").map((line) => line.split(""));

if (import.meta.main) {
  const file = Deno.readTextFileSync("./04/input.txt");
  const input = parseInput(file);
  const dictionary = ["XMAS"];

  const res = boardReduce(
    (acc: { [key: string]: number }, { x, y }) => {
      return directions.reduce(
        (acc2, direction) => {
          return mergeResults(
            acc2,
            doWordSearchAtPositionInDirection(
              [...input.map((r) => [...r])],
              { x, y },
              dictionary,
              direction,
            ),
          );
        },
        acc,
      );
    },
    {},
    [...input.map((r) => [...r])],
  );

  console.log(res);
}
