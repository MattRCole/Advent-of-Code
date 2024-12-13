export const toNumericKeys = (obj: { [key: number]: unknown }) =>
  Object.keys(obj).map((c) => parseInt(c));

export const toKeysWithDefinedValues = (
  obj: { [key: string | number | symbol]: unknown },
) =>
  Object.entries(obj).filter(([_, val]) => val !== undefined).map(([k]) => k);

export const toNumericKeysWithDefinedValues = (
  obj: { [key: number]: unknown },
) => toKeysWithDefinedValues(obj).map((c) => parseInt(c));

export const omit = <T extends object, O extends (keyof T)[]>(
  obj: T,
  toOmit: O,
): Omit<T, O[number]> =>
  Object.keys(obj).reduce(
    (acc, k) =>
      toOmit.includes(k as keyof T)
        ? acc
        : ({ ...acc, [k]: obj[k as keyof T] }),
    {} as Omit<T, O[number]>,
  );

export const getAtPath = (
  obj: unknown,
  path: (string | number | symbol)[],
): unknown => {
  if (obj === undefined) return undefined;
  let currentVal: unknown = obj;
  for (const key of path) {
    currentVal =
      (currentVal as { [key: string | number | symbol]: unknown })[key];
    if (!currentVal) return currentVal;
  }
  return currentVal;
};

export const getAtPathWithDefault = <T>(
  obj: unknown,
  path: (string | number | symbol)[],
  defaultValue: T,
): T => {
  if (obj === undefined) return defaultValue;
  let currentVal: unknown = obj;
  for (const key of path) {
    currentVal =
      (currentVal as { [key: string | number | symbol]: unknown })[key];
    if (currentVal === undefined) return defaultValue;
  }
  return currentVal as T;
};
