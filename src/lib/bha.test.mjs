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

test("additive length and min/max OD and ID metrics update after every addition", () => {
  const steps = bhaProgress();
  assert.equal(steps.length, ORDER.length);
  let lengthM = 0;
  let largestOd = 0;
  let smallestOd = Infinity;
  let smallestId = Infinity;
  let largestId = 0;
  for (const step of steps) {
    lengthM = Math.round((lengthM + step.lengthM) * 1000) / 1000;
    largestOd = Math.max(largestOd, step.odIn);
    smallestOd = Math.min(smallestOd, step.odIn);
    smallestId = Math.min(smallestId, step.idIn);
    largestId = Math.max(largestId, step.idIn);
    assert.equal(step.totalLengthM, lengthM);
    assert.equal(step.largestOdIn, largestOd);
    assert.equal(step.minOdIn, smallestOd);
    assert.equal(step.minIdIn, smallestId);
    assert.equal(step.maxIdIn, largestId);
  }
  assert.equal(steps[0].largestOdIn, 6.125);
  assert.equal(steps[1].largestOdIn, 6.75);
  assert.equal(steps[2].largestOdIn, 8.5);
  assert.equal(steps.at(-1).largestOdIn, 8.5);
  assert.equal(steps.at(-1).minOdIn, 4.75);
  assert.equal(steps.at(-1).minIdIn, 2.0);
  assert.equal(steps.at(-1).maxIdIn, 3.0);
  assert.equal(steps.at(-1).maxOdKey, "stab");
  assert.equal(steps.at(-1).minOdKey, "pony");
  assert.equal(steps.at(-1).minIdKey, "exciter");
  assert.equal(steps.at(-1).maxIdKey, "mwd");
  assert.equal(steps.at(-1).totalLengthM, 41.03);
});
