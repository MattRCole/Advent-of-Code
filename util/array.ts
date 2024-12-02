export const sum = (arr: number[]) => arr.reduce((acc, num) => acc + num, 0);

export const multiply = (arr: number[]) =>
  arr.reduce((acc, num) => acc * num, 1);

export const reverse = <T>(arr: T[]) => [...arr].reverse();

export const lastIndex = <T>({ length }: T[]) => length - 1;

export const last = <T>(arr: T[]) => arr.slice(-1)[0];

export const head = <T>(arr: T[]) => arr[0];

export const rest = <T>(arr: T[]) => arr.slice(1);

export const splice = <T>(
  arr: T[],
  index: number,
  deleteCount: number,
  ...newItems: T[]
) => [...arr.slice(0, index), ...newItems, ...arr.slice(index + deleteCount)];

export const anyMatch = <T>(
  arr: T[],
  { item, predicate }: { item?: T; predicate?: (arg: T) => unknown } = {
    item: undefined,
    predicate: undefined,
  },
) => {
  if (item === undefined && predicate === undefined) {
    throw new Error(
      `Cannot search array without item or predicate arr: ${arr}`,
    );
  }

  if (item !== undefined && predicate !== undefined) {
    throw new Error(
      `Cant handle both an item and a predicate option, just one or the other please. arr: ${arr}, item: ${item}, predicate: ${predicate}`,
    );
  }

  for (const thing of arr) {
    if (item !== undefined && Object.is(thing, item)) return true;

    if (predicate !== undefined && predicate(thing)) return true;
  }

  return false;
};

export const all = <T>(
  arr: T[],
  { item, predicate }: { item?: T; predicate?: (arg: T) => unknown } = {
    item: undefined,
    predicate: undefined,
  },
) => {
  if (item === undefined && predicate === undefined) {
    throw new Error(
      `Cannot search array without item or predicate arr: ${arr}`,
    );
  }

  if (item !== undefined && predicate !== undefined) {
    throw new Error(
      `Cant handle both an item and a predicate option, just one or the other please. arr: ${arr}, item: ${item}, predicate: ${predicate}`,
    );
  }

  for (const thing of arr) {
    if (item !== undefined && !Object.is(thing, item)) return false;

    if (predicate !== undefined && !predicate(thing)) return false;
  }

  return true;
};

export const zip = <T>(...arrs: T[][]): T[][] => {
  const lengths = arrs.map(({ length }) => length);
  const minLength = Math.min(...lengths);
  return new Array(minLength).fill(undefined).map((_, index) =>
    arrs.map((arr) => arr[index])
  );
};
