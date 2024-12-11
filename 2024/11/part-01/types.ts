export type MessageToMainThread = { totalRocks: number; blinks: number };
export type MessageToWorker = {
  rocks: number[];
  blinks: number;
  targetBlinks: number;
};
