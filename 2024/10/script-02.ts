import { mapTrailHead, parseInput, Point } from "./script-01.ts";

if (import.meta.main) {
  const file = Deno.readTextFileSync("./10/input.txt");
  const input = parseInput(file);

  let total = 0;
  for (const trailHead of input.trailHeads) {
    total += mapTrailHead(trailHead, input.map, false);
  }
  console.log({ res: total });
}
