import assert from "node:assert/strict";
import test from "node:test";
import { BHA_BUILD, bhaProgress } from "./bha.mjs";

const ORDER = [
  "Bit",
  "Motor",
  "Stabilized Sub",
  "NM Pony",
  "MWD Carrier",
  "NM Flex Monel",
  "NM Flex Monel",
  "Subs",
  "Exciter / Agitator",
  "Shock Sub",
  "Jars",
];

test("BHA order is the bit, then up the string, with two NM Flex Monels", () => {
  assert.deepEqual(BHA_BUILD.map((piece) => piece.name), ORDER);
  assert.equal(BHA_BUILD.filter((piece) => piece.name === "NM Flex Monel").length, 2);
  assert.notEqual(BHA_BUILD[5].key, BHA_BUILD[6].key);
});

test("length and largest OD update after every addition", () => {
  const steps = bhaProgress();
  assert.equal(steps.length, ORDER.length);
  let lengthM = 0;
  let largestOd = 0;
  for (const step of steps) {
    lengthM = Math.round((lengthM + step.lengthM) * 1000) / 1000;
    largestOd = Math.max(largestOd, step.odIn);
    assert.equal(step.totalLengthM, lengthM);
    assert.equal(step.largestOdIn, largestOd);
  }
  assert.equal(steps[0].largestOdIn, 6.125);
  assert.equal(steps[1].largestOdIn, 6.75);
  assert.equal(steps[2].largestOdIn, 8.5);
  assert.equal(steps.at(-1).largestOdIn, 8.5);
  assert.ok(steps.at(-1).totalLengthM > steps[0].totalLengthM);
});
