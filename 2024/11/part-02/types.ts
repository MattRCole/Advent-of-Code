export type MessageToMainThread = { rocks: number[]; blinks: number };
export type MessageToWorker = {
  rocks: number[];
  blinks: number;
  targetBlinks: number;
};
