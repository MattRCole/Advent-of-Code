import { sum } from "../../util/array.ts";
import { blink } from "./lib.ts";
import { MessageToMainThread, MessageToWorker } from "./types.ts";

const MAXROCKS = 10000;

let working = false;

onmessage = async (e: MessageEvent<MessageToWorker>) => {
  // console.log("hiiii");
  const subWorkers: (Worker | number)[] = [];
  if (working) throw new Error("Cannot trigger a worker a second time!!!");

  working = true;
  let rocks = e.data.rocks;
  let blinks = e.data.blinks;
  const targetBlinks = e.data.targetBlinks;
  while (blinks < targetBlinks) {
    // console.log("Blink!!!");
    rocks = blink(rocks);
    blinks++;
    if (rocks.length > MAXROCKS) {
      const sliceIndex = Math.floor(MAXROCKS / 2);
      const toPassOff = rocks.slice(sliceIndex);
      rocks = rocks.slice(0, sliceIndex);
      const subWorker = new Worker(`file://${import.meta.dirname}/worker.ts`, {
        type: "module",
      });
      const workerIndex = subWorkers.length;
      subWorkers.push(subWorker);
      subWorker.onmessage = (e: MessageEvent<MessageToMainThread>) => {
        subWorkers[workerIndex] = e.data.totalRocks;
      };
      subWorker.postMessage(
        { blinks, rocks: toPassOff, targetBlinks } as MessageToWorker,
      );
    }
  }
  // console.log("All done!");
  while (subWorkers.length && subWorkers.some((w) => w instanceof Worker)) {
    await new Promise((res) => setTimeout(res, 250));
  }
  postMessage(
    {
      blinks,
      totalRocks: rocks.length + sum(subWorkers as number[]),
    } as MessageToMainThread,
  );
};
