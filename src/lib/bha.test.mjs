import assert from "node:assert/strict";
import test from "node:test";
import { BHA_BUILD, apiMakeUpTorque, bhaProgress } from "./bha.mjs";

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

test("BHA order, torqued thread continuity across X-Over, and OD/ID chart torque specs", () => {
  assert.deepEqual(BHA_BUILD.map((piece) => piece.name), ORDER);
  assert.equal(BHA_BUILD.filter((piece) => piece.name === "NM Flex Monel").length, 2);
  assert.notEqual(BHA_BUILD[5].key, BHA_BUILD[6].key);

  // Every adjacent tool joint in the vertical BHA must have matching thread type.
  for (let i = 0; i < BHA_BUILD.length - 1; i++) {
    const upper = BHA_BUILD[i];
    const lower = BHA_BUILD[i + 1];
    assert.equal(
      upper.btmThread,
      lower.topThread,
      `joint ${upper.name} BTM (${upper.btmThread}) must match ${lower.name} TOP (${lower.topThread})`,
    );
  }

  // Verified API RP 7G / Command-SMFI OD × ID make-up torque chart lookups:
  // 4 1/2 REG @ 57 mm (2 1/4") ID -> 21,750 ft·lbs (29.5 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 REG", 216, 57), { ftLbs: 21750, kNm: 29.5 });
  // 4 1/2 XH (NC46) @ 171 mm OD, 71 mm (2 13/16") ID -> 22,430 ft·lbs (30.4 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 XH", 171, 71), { ftLbs: 22430, kNm: 30.4 });
  // 4 1/2 XH (NC46) @ 171 mm OD, 76 mm (3") ID (MWD Carrier) -> 20,310 ft·lbs (27.5 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 XH", 171, 76), { ftLbs: 20310, kNm: 27.5 });
  // 4 1/2 XH (NC46) @ 170 mm OD, 57 mm (2 1/4") ID (X-Over TOP) -> 28,020 ft·lbs (38.0 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 XH", 170, 57), { ftLbs: 28020, kNm: 38.0 });
  // 4 1/2 IF (NC50) @ 169 mm OD, 51 mm (2") ID (Exciter) -> 33,900 ft·lbs (46.0 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 IF", 169, 51), { ftLbs: 33900, kNm: 46.0 });
  // 4 1/2 IF (NC50) @ 170 mm OD, 57 mm (2 1/4") ID (X-Over BTM & Jars) -> 35,100 ft·lbs (47.6 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 IF", 170, 57), { ftLbs: 35100, kNm: 47.6 });
  // 4 1/2 IF (NC50) @ 171 mm OD, 57 mm (2 1/4") ID (Shock Sub) -> 35,820 ft·lbs (48.6 kN·m)
  assert.deepEqual(apiMakeUpTorque("4 1/2 IF", 171, 57), { ftLbs: 35820, kNm: 48.6 });

  // Tools with identical TOP & BTM threads have sameThread = true (single torque shown);
  // crossovers (Motor and Subs - X-Over) have sameThread = false (both TOP & BTM torques shown).
  const xo = BHA_BUILD[7];
  assert.equal(xo.name, "Subs - X-Over");
  assert.equal(xo.sameThread, false);
  assert.equal(xo.topThread, "4 1/2 XH");
  assert.equal(xo.btmThread, "4 1/2 IF");
  assert.equal(xo.topTorqueKnm, 38.0);
  assert.equal(xo.topTorqueFtLbs, 28020);
  assert.equal(xo.btmTorqueKnm, 47.6);
  assert.equal(xo.btmTorqueFtLbs, 35100);

  for (const idx of [2, 3, 4, 5, 6, 8, 9, 10]) {
    assert.equal(BHA_BUILD[idx].sameThread, true, `${BHA_BUILD[idx].name} has matching TOP and BTM threads`);
  }
  for (const idx of [8, 9, 10]) {
    assert.equal(BHA_BUILD[idx].topThread, "4 1/2 IF");
    assert.equal(BHA_BUILD[idx].btmThread, "4 1/2 IF");
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
