const splitRock = (rock: number): number[] => {
  const strock = String(rock);
  const splitIndex = Math.floor(strock.length / 2);
  const half1 = strock.split("").slice(0, splitIndex);
  const half2 = strock.split("").slice(splitIndex);

  return [parseInt(half1.join("")), parseInt(half2.join(""))];
};

const handleRock = (rock: number): number[] => {
  if (rock === 0) {
    return [1];
  }
  if (String(rock).length % 2 === 0) {
    return splitRock(rock);
  }
  return [rock * 2024];
};

export const blink = (rocks: number[]): number[] => {
  return rocks.reduce(
    (acc, rock) => [...acc, ...handleRock(rock)],
    [] as number[],
  );
};
