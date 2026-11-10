import assert from "node:assert/strict";
import test from "node:test";
import { BHA_BUILD, THREAD_TORQUE_KNM, bhaProgress } from "./bha.mjs";

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

test("BHA order, torqued thread continuity across X-Over, and industry torque specs", () => {
  assert.deepEqual(BHA_BUILD.map((piece) => piece.name), ORDER);
  assert.equal(BHA_BUILD.filter((piece) => piece.name === "NM Flex Monel").length, 2);
  assert.notEqual(BHA_BUILD[5].key, BHA_BUILD[6].key);

  // Every adjacent tool joint in the vertical BHA must have matching thread and make-up torque.
  for (let i = 0; i < BHA_BUILD.length - 1; i++) {
    const upper = BHA_BUILD[i];
    const lower = BHA_BUILD[i + 1];
    assert.equal(
      upper.btmThread,
      lower.topThread,
      `joint ${upper.name} BTM (${upper.btmThread}) must match ${lower.name} TOP (${lower.topThread})`,
    );
    assert.equal(
      upper.btmTorqueKnm,
      lower.topTorqueKnm,
      `joint ${upper.name} BTM torque (${upper.btmTorqueKnm}) must match ${lower.name} TOP torque (${lower.topTorqueKnm})`,
    );
    assert.equal(upper.btmTorqueKnm, THREAD_TORQUE_KNM[upper.btmThread]);
  }

  // Subs - X-Over crosses from 4 1/2 XH (30.5 kN·m) to 4 1/2 IF (38.6 kN·m),
  // and items 9, 10, 11 stay on 4 1/2 IF (38.6 kN·m).
  const xo = BHA_BUILD[7];
  assert.equal(xo.name, "Subs - X-Over");
  assert.equal(xo.topThread, "4 1/2 XH");
  assert.equal(xo.btmThread, "4 1/2 IF");
  assert.equal(xo.topTorqueKnm, 30.5);
  assert.equal(xo.btmTorqueKnm, 38.6);
  for (const idx of [8, 9, 10]) {
    assert.equal(BHA_BUILD[idx].topThread, "4 1/2 IF");
    assert.equal(BHA_BUILD[idx].btmThread, "4 1/2 IF");
    assert.equal(BHA_BUILD[idx].topTorqueKnm, 38.6);
    assert.equal(BHA_BUILD[idx].btmTorqueKnm, 38.6);
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
  for (const piece of BHA_BUILD.slice(1)) {
    assert.ok(piece.odMm < BHA_BUILD[0].odMm, `${piece.name} OD (${piece.odMm} mm) must be smaller than the bit`);
    assert.ok(piece.odMm >= 168 && piece.odMm <= 173, `${piece.name} OD (${piece.odMm} mm) stays within a few mm of 171 mm`);
  }
});
