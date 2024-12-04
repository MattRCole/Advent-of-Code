export const parseInput = (file: string) => {
  return file.split("\n").map((l) =>
    l.split(" ").filter((c) => c.trim() !== "").map((i) => parseInt(i))
  );
};

export const getNumberCounts = (input: number[][]) => {
  const left: { [key: number]: number } = {};

  const right: { [key: number]: number } = {};
  input.map(([l, r]) => {
    left[l] = (left[l] || 0) + 1;
    right[r] = (right[r] || 0) + 1;
  });

  return { left, right };
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./01/input.txt");

  const input = parseInput(file);

  const { left, right } = getNumberCounts(input);

  const res = Object.keys(left).reduce((acc, lKeyStr) => {
    const lKey = parseInt(lKeyStr);

    const newAcc = right[lKey] === undefined
      ? acc
      : (acc + (lKey * right[lKey] * left[lKey]));

    return newAcc;
  }, 0);

  console.log({ res });
}
