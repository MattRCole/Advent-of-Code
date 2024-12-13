const toMap = <T = string>(
  file: string,
  transform?: (char: string) => T,
): typeof transform extends undefined ? T extends string ? string[][] : never
  : T[][] =>
  file.split("\n").map((l) =>
    l.split("").map((c) => transform ? transform(c) : c as T)
  );

const toNumberMap = (line: string) => toMap(line, (char) => parseInt(char));

const toLines = <T = string>(
  file: string,
  transform?: (line: string) => T,
): typeof transform extends undefined ? T extends string ? string[] : never
  : T[] => file.split("\n").map((l) => transform ? transform(l) : l as T);
