import { sum } from "../util/array.ts";
// import { blink } from "./lib.ts";
import { MessageToMainThread, MessageToWorker } from "./part-01/types.ts";

const parseInput = (file: string) => file.split(" ").map((i) => parseInt(i));

// const workerResults: { [key: string]: number } = {};
// const outstandingWorkers: { [key: string]: boolean } = {};

const handleWork = (
  message: MessageToWorker,
): Promise<number> => {
  return new Promise((res) => {
    const worker = new Worker(
      `file://${import.meta.dirname}/part-01/worker.ts`,
      {
        type: "module",
        name: "Top Level Worker",
      },
    );
    worker.onmessage = (e: MessageEvent<MessageToMainThread>) => {
      res(e.data.totalRocks);
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

if (import.meta.main) {
  const file = Deno.readTextFileSync("./11/input.txt");
  const input = parseInput(file);
  // const workerPromise = handleSplitWorker(6, { blinks: 0, rocks: input });
  // let allOutstandingWorkers = getOutstandingWorkers();
  // const encoder = new TextEncoder();
  // console.log(allOutstandingWorkers);
  // let started = false;
  // while (allOutstandingWorkers.length || started === false) {
  //   console.log("hi");
  //   started = true;
  //   await Deno.stdout.write(
  //     encoder.encode(
  //       `\r${
  //         String(allOutstandingWorkers.length).padStart(10, "0")
  //       } outstanding workers`,
  //     ),
  //   );
  //   await sleep(250);
  //   allOutstandingWorkers = getOutstandingWorkers();
  //   if (allOutstandingWorkers.length === 0) {
  //     console.log(
  //       {
  //         res: sum(Object.values(workerResults)),
  //       },
  //     );
  //   }
  // }
  // console.log("hiii!!");
  const res = await handleWork({ blinks: 0, targetBlinks: 25, rocks: input });
  console.log({ res });
}
