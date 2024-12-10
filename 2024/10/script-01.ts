export type Point = { x: number; y: number };

export const parseInput = (file: string) => {
  const trailHeads = [] as Point[];
  const map = file.split("\n").map((l, y) =>
    l.split("").map((char, x) => {
      const num = parseInt(char);

      if (num === 0) trailHeads.push({ x, y });

      return num;
    })
  );
  return { trailHeads, map };
};

export const visitNeighbors = (
  map: number[][],
  point: Point,
  callback: (value: number, point: Point) => void,
) => {
  for (let j = point.y - 1; j <= point.y + 1; j++) {
    if (j < 0 || j >= map.length) continue;
    const row = map[j];
    for (let i = point.x - 1; i <= point.x + 1; i++) {
      if (i < 0 || i >= row.length) continue;
      if (i === point.x && j === point.y) continue;
      if (i !== point.x && j !== point.y) continue;

      callback(row[i], { x: i, y: j });
    }
  }
};

const pointToKey = (point: Point) => `${point.x}:${point.y}`;

export const mapTrailHead = (
  startingPoint: Point,
  map: number[][],
  dedupe: boolean = true,
): number => {
  const stack = [{ point: startingPoint, value: 0 }];

  const dedupedResults: Set<string> = new Set();
  const allResults: Point[] = [];
  while (stack.length) {
    const searchItem = stack.pop();

    if (searchItem === undefined) throw new Error("AAAAAAAAAAAAAAAAAAAAAAAAAA");

    const validPoints = reduceOverNeighbors(
      map,
      searchItem.point,
      (acc, value, point) => {
        if (value - searchItem.value !== 1) return acc;

        return [...acc, point];
      },
      [] as Point[],
    );

    if (searchItem.value === 8) {
      if (dedupe) {
        for (const point of validPoints) {
          dedupedResults.add(pointToKey(point));
        }
      } else {
        allResults.push(...validPoints);
      }
    } else {
      stack.push(
        ...validPoints.map((point) => ({ point, value: searchItem.value + 1 })),
      );
    }
  }
  return dedupe ? dedupedResults.size : allResults.length;
};

const reduceOverNeighbors = <T>(
  map: number[][],
  point: Point,
  callback: (acc: T, value: number, point: Point) => T,
  initialAcc: T,
): T => {
  let acc = initialAcc;
  visitNeighbors(map, point, (value, neighborPoint) => {
    acc = callback(acc, value, neighborPoint);
  });
  return acc;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./10/input.txt");
  const input = parseInput(file);

  let total = 0;
  for (const trailHead of input.trailHeads) {
    total += mapTrailHead(trailHead, input.map);
  }
  console.log({ res: total });
  // console.log(input);
  // visitNeighbors(
  //   input.map,
  //   { x: 1, y: 1 },
  //   (value, point) => console.log({ value, point }),
  // );
}
