export const sum = (arr: number[]) => arr.reduce((acc, num) => acc + num, 0);

export const multiply = (arr: number[]) =>
  arr.reduce((acc, num) => acc * num, 1);

export const reverse = <T>(arr: T[]) => [...arr].reverse();

export const getArray = <T = undefined>(length: number, fill?: T): T[] =>
  new Array(length).fill(fill);

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

export const zip = <T, R>(a: T[], b: R[]): ([T, R])[] => {
  const lengths = [a, b].map(({ length }) => length);
  const minLength = Math.min(...lengths);
  return getArray(minLength).map((_, index) =>
    [a, b].map((arr) => arr[index]) as [T, R]
  );
};

export const stableSort = <T>(
  arr: T[],
  comparator: (a: T, b: T) => number,
): T[] => {
  const zipped = zip(arr, getArray(arr.length).map((_, index) => index));

  return zipped.toSorted(([a, aIndex], [b, bIndex]) => {
    const compRes = comparator(a, b);
    return compRes || aIndex - bIndex;
  }).map(([item, _]) => item);
};

export const enumerate = <T>(arr: T[]): ([number, T])[] =>
  zip(getArray(arr.length).map((_, idx) => idx), arr);
