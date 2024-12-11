import { sum } from "../util/array.ts";
// import { blink } from "./lib.ts";
import { existsSync } from "jsr:@std/fs";
import { MessageToMainThread, MessageToWorker } from "./part-02/types.ts";

const parseInput = (file: string) => file.split(" ").map((i) => parseInt(i));

// const workerResults: { [key: string]: number } = {};
// const outstandingWorkers: { [key: string]: boolean } = {};

const handleWork = (
  message: MessageToWorker,
): Promise<number[]> => {
  return new Promise((res) => {
    const worker = new Worker(
      `file://${import.meta.dirname}/part-02/worker.ts`,
      {
        type: "module",
        name: "Top Level Worker",
      },
    );
    worker.onmessage = (e: MessageEvent<MessageToMainThread>) => {
      worker.terminate();
      res(e.data.rocks);
    };

    worker.postMessage({ ...message } as MessageToWorker);
  });
};

// const handleSplitWorker = (
//   targetBlinks: number,
//   message: MessageToMainThread,
//   isTopLevel = true,
// ) => {
//   const currentDirectory = import.meta.dirname;
//   const workerName = crypto.randomUUID();
//   outstandingWorkers[workerName] = true;
//   const downStreamAwaits: Promise<void>[] = [
//     new Promise((res) => {
//       let intervalMarker: ReturnType<typeof setInterval> = -1;

//       intervalMarker = setInterval(() => {
//         if (outstandingWorkers[workerName] === false) {
//           clearInterval(intervalMarker);
//           res();
//         }
//       }, 200);
//     }),
//   ];
//   const filePath = `file://${currentDirectory}/worker.ts`;
//   // console.log(filePath);
//   const worker = new Worker(filePath, {
//     name: workerName,
//     type: "module",
//   });

//   worker.onmessage = (e: MessageEvent<MessageToMainThread>) => {
//     if (e.data.blinks >= targetBlinks) {
//       if (isTopLevel) {
//         console.log(
//           {
//             res: sum(Object.values(workerResults)),
//           },
//         );
//         console.log(`${workerName} is done!`);
//       }
//       workerResults[workerName] = e.data.rocks.length;
//       outstandingWorkers[workerName] = false;
//     } else {
//       downStreamAwaits.push(handleSplitWorker(targetBlinks, e.data, false));
//     }
//   };
//   worker.postMessage({ ...message, targetBlinks } as MessageToWorker);
//   return new Promise<void>((res) =>
//     Promise.all(downStreamAwaits).then(() => {
//       res();
//     })
//   );
// };

// const getOutstandingWorkers = () =>
//   Object.entries(outstandingWorkers).filter(([_, working]) => working === true)
//     .map(([name]) => name);

// const sleep = (ms: number): Promise<void> =>
//   new Promise((res) => {
//     setTimeout(res, ms);
//   });

const MAXARRAYSIZE = 5000;

const splitAndWriteResults = (
  baseDir: string,
  batchNo: number,
  subIndexStart: number,
  rocks: number[],
): { currentIndex: number; remainder: number[] } => {
  const batchDir = `${baseDir}/${String(batchNo).padStart(2, "0")}`;
  const encoder = new TextEncoder();
  Deno.mkdirSync(batchDir, { recursive: true });
  let i = 0;
  for (i; i < rocks.length; i += MAXARRAYSIZE) {
    const toWrite = rocks.slice(i, i + MAXARRAYSIZE);

    Deno.writeFileSync(
      `${batchDir}/${i + subIndexStart}.json`,
      encoder.encode(JSON.stringify(toWrite)),
    );
  }
  return { currentIndex: subIndexStart + rocks.length, remainder: [] };
};

const getBatchFilesInOrder = (batchDir: string) => {
  return [...Deno.readDirSync(batchDir)].filter(({ isFile, name }) =>
    isFile && name.endsWith(".json")
  ).map((entry) => {
    const order = parseInt(entry.name.replace(".json", ""));
    return [order, entry.name] as [number, string];
  }).toSorted(([orderA, _], [orderB, __]) => orderA - orderB).map(([_, name]) =>
    name
  );
};

const processBatch = async (
  baseDir: string,
  prevBatchNo: number,
  batchSize: number,
) => {
  const batchDir = `${baseDir}/${String(prevBatchNo).padStart(2, "0")}`;
  const nextBatchNo = prevBatchNo + batchSize;
  const files = getBatchFilesInOrder(batchDir);

  let subIndex = 0;
  let cumulativeResult = [] as number[];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = `${batchDir}/${file}`;
    const rocks: number[] = (await import(filePath, {
      with: { type: "json" },
    })).default;
    // console.log({ rocks });
    const result = await handleWork({
      blinks: 0,
      targetBlinks: batchSize,
      rocks,
    });
    if (cumulativeResult.length + result.length < MAXARRAYSIZE) {
      cumulativeResult = [...cumulativeResult, ...result];
    } else {
      const { currentIndex } = splitAndWriteResults(
        baseDir,
        nextBatchNo,
        subIndex,
        cumulativeResult,
      );
      cumulativeResult = result;
      subIndex = currentIndex;
    }
  }
  if (cumulativeResult.length) {
    splitAndWriteResults(baseDir, nextBatchNo, subIndex, cumulativeResult);
  }
};

const getBatchTotal = async (baseDir: string, batchNo: number) => {
  const batchDir = `${baseDir}/${batchNo.toString().padStart(2, "0")}`;
  let total = 0;
  for (const file of getBatchFilesInOrder(batchDir)) {
    const rocks: number[] = (await import(`${batchDir}/${file}`, {
      with: { type: "json" },
    })).default;
    total += rocks.length;
  }
  return total;
};

if (import.meta.main) {
  const file = Deno.readTextFileSync("./11/2024.txt");
  const input = parseInput(file);
  const batchSize = 1;
  const targetBlinks = 10;

  Deno.makeTempDirSync;
  const baseTmpDir = `${import.meta.dirname}/tmp`;
  if (existsSync(baseTmpDir)) {
    Deno.removeSync(baseTmpDir, { recursive: true });
    // if (existsSync(baseTmpDir)) throw new Error()
  }
  Deno.mkdirSync(baseTmpDir, { recursive: true });

  let totalBlinks = 0;
  while (totalBlinks < targetBlinks) {
    if (totalBlinks === 0) {
      const results = await handleWork({
        blinks: 0,
        targetBlinks: batchSize,
        rocks: input,
      });
      splitAndWriteResults(baseTmpDir, 0, 0, results);
    } else {
      await processBatch(baseTmpDir, totalBlinks - batchSize, batchSize);
    }
    totalBlinks += batchSize;
  }
  const res = await getBatchTotal(baseTmpDir, targetBlinks - batchSize);
  // const res = await handleWork({ blinks: 0, targetBlinks: 25, rocks: input });
  console.log({ res });
}
