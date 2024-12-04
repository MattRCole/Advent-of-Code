import { sum } from "../util/array.ts";

enum Status {
  Rising = "rising",
  Falling = "falling",
  Unsafe = "unsafe",
  Unknown = "unknown",
}

export const isValidRow = (row: number[]) => {
  const { status } = row.reduce(
    (
      acc: { lastNumber?: number; status: Status },
      num,
    ): { lastNumber?: number; status: Status } => {
      const { lastNumber, status } = acc;
      if (status === Status.Unsafe) {
        return { lastNumber: undefined, status: Status.Unsafe };
      }
      if (lastNumber === undefined) {
        return { lastNumber: num, status: Status.Unknown };
      }

      if (status === Status.Unknown) {
        const diff = lastNumber - num;
        if (diff > 3 || diff < -3 || diff === 0) {
          return { lastNumber: undefined, status: Status.Unsafe };
        }

        if (diff > 0) return { lastNumber: num, status: Status.Rising };
        else return { lastNumber: num, status: Status.Falling };
      } else {
        const diff = lastNumber - num;
        if (diff > 3 || diff < -3 || diff === 0) {
          return { lastNumber: undefined, status: Status.Unsafe };
        }
        if (diff < 0 && status === Status.Rising) {
          return { lastNumber: undefined, status: Status.Unsafe };
        }
        if (diff > 0 && status === Status.Falling) {
          return { lastNumber: undefined, status: Status.Unsafe };
        }

        return { lastNumber: num, status };
      }
    },
    { lastNumber: undefined, status: Status.Unknown },
  );

  if (status === Status.Unknown || status === Status.Unsafe) return false;
  else return true;
};

export const toRows = (file: string) =>
  file.split("\n").map((r) =>
    r.split(" ").filter(({ length }) => length).map((n) => parseInt(n))
  );

if (import.meta.main) {
  const file = Deno.readTextFileSync("./02/input.txt");
  const rows = toRows(file);
  const res = sum(rows.map(isValidRow).map((res) => res ? 1 : 0));
  console.log({ res });
}
