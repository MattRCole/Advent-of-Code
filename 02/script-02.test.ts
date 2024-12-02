import { assertEquals } from "jsr:@std/assert";
import { exhaustiveSearch } from "./script-02.ts";
import { isValidRow, toRows } from "./script-01.ts";
import { splice } from "../util/array.ts";

Deno.test("passes simple arrays", () => {
  const testArr = [1, 3, 5, 7];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with simple problem (rising)", () => {
  const testArr = [1, 1, 3, 5, 7];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with false down problem (rising)", () => {
  const testArr = [3, 2, 5, 7, 9];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("Fails large jumps (rising)", () => {
  const testArr = [3, 7, 11, 12, 13];

  assertEquals(exhaustiveSearch(testArr), false);
});

Deno.test("passes one large jump (rising)", () => {
  const testArr = [7, 11, 12, 13];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes one large jump (falling)", () => {
  const testArr = [13, 9, 8, 7, 5];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes one large wrong way jump at start (falling)", () => {
  const testArr = [12, 1, 11, 10, 9];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes one large wrong way jump at start (rising)", () => {
  const testArr = [5, 1, 6, 7, 9, 12];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes one repeat at start (rising)", () => {
  const testArr = [5, 5, 6, 7, 9, 12];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes one repeat at start (falling)", () => {
  const testArr = [9, 9, 8, 7, 5];

  assertEquals(exhaustiveSearch(testArr), true);
});
Deno.test("passes array with complex problem (rising)", () => {
  const testArr = [1, 4, 3, 4];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with complex problem (rising)", () => {
  const testArr = [3, 6, 5, 7];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("fails array with two complex problems (rising)", () => {
  const testArr = [3, 8, 5, 7, 7];
  assertEquals(exhaustiveSearch(testArr), false);
});

Deno.test("passes simple array (falling)", () => {
  const testArr = [7, 6, 3, 2, 1];

  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with simple problem (falling)", () => {
  const testArr = [7, 7, 6, 3, 2, 1];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with false up problem (falling)", () => {
  const testArr = [7, 8, 6, 3, 2, 1];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("passes array with complex problem (falling)", () => {
  const testArr = [3, 6, 5, 6];
  assertEquals(exhaustiveSearch(testArr), true);
});

Deno.test("fails array with two complex problems (falling)", () => {
  const testArr = [3, 8, 5, 7, 7];
  assertEquals(exhaustiveSearch(testArr), false);
});
