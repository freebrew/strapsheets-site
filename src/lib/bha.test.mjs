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
  "Subs - X-Over",
  "Exciter / Agitator",
  "Shock Sub",
  "Jars",
];

test("BHA order is the bit, then up the string, with two NM Flex Monels and Subs - X-Over", () => {
  assert.deepEqual(BHA_BUILD.map((piece) => piece.name), ORDER);
  assert.equal(BHA_BUILD.filter((piece) => piece.name === "NM Flex Monel").length, 2);
  assert.notEqual(BHA_BUILD[5].key, BHA_BUILD[6].key);
  for (const piece of BHA_BUILD) {
    assert.ok(typeof piece.topThread === "string" && piece.topThread.length > 0);
    assert.ok(typeof piece.btmThread === "string" && piece.btmThread.length > 0);
  }
  const jars = BHA_BUILD.find((piece) => piece.key === "jars");
  assert.equal(jars?.jarSpecs, "UP 48K DN 22K SEC 39");
  for (const key of ["exciter", "shock", "jars"]) {
    const tool = BHA_BUILD.find((piece) => piece.key === key);
    assert.ok(tool && tool.lengthM > 5 && tool.lengthM < 7, `${key} length (${tool?.lengthM} m) must be > 5 m and < 7 m`);
  }
});

test("additive length and min/max OD and ID metrics (in mm) update after every addition", () => {
  const steps = bhaProgress();
  assert.equal(steps.length, ORDER.length);
  let lengthM = 0;
  let largestOd = 0;
  let smallestOd = Infinity;
  let smallestId = Infinity;
  let largestId = 0;
  for (const step of steps) {
    lengthM = Math.round((lengthM + step.lengthM) * 1000) / 1000;
    largestOd = Math.max(largestOd, step.odMm);
    smallestOd = Math.min(smallestOd, step.odMm);
    smallestId = Math.min(smallestId, step.idMm);
    largestId = Math.max(largestId, step.idMm);
    assert.equal(step.totalLengthM, lengthM);
    assert.equal(step.largestOdMm, largestOd);
    assert.equal(step.minOdMm, smallestOd);
    assert.equal(step.minIdMm, smallestId);
    assert.equal(step.maxIdMm, largestId);
  }
  assert.equal(steps[0].largestOdMm, 216);
  assert.equal(steps[1].largestOdMm, 216);
  assert.equal(steps[1].minOdMm, 171);
  assert.equal(steps[2].largestOdMm, 216);
  assert.equal(steps.at(-1).largestOdMm, 216);
  assert.equal(steps.at(-1).minOdMm, 169);
  assert.equal(steps.at(-1).minIdMm, 51);
  assert.equal(steps.at(-1).maxIdMm, 76);
  assert.equal(steps.at(-1).maxOdKey, "bit");
  assert.equal(steps.at(-1).minOdKey, "pony");
  assert.equal(steps.at(-1).minIdKey, "exciter");
  assert.equal(steps.at(-1).maxIdKey, "mwd");
  assert.equal(steps.at(-1).totalLengthM, 51.83);
  // Every tool behind the bit belongs to the same nominal 171 mm BHA size class,
  // varying by only a couple to a few millimetres (169 to 172 mm).
  for (const piece of BHA_BUILD.slice(1)) {
    assert.ok(piece.odMm < BHA_BUILD[0].odMm, `${piece.name} OD (${piece.odMm} mm) must be smaller than the bit`);
    assert.ok(piece.odMm >= 168 && piece.odMm <= 173, `${piece.name} OD (${piece.odMm} mm) stays within a few mm of 171 mm`);
  }
});
