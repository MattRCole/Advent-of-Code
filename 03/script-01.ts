const parseInput = (file: string) => file;

if (import.meta.main) {
  const file = Deno.readTextFileSync("./03/input.txt");
  const input = parseInput(file);
}
