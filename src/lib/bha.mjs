/**
 * Inventory-workflow preview. Vertical BHA torqued together from Bit (01) through Jars (11).
 * All OD/ID in mm, lengths in m, and make-up torque specs in both kN·m and ft·lbs
 * derived from API RP 7G / IADC and Command-SMFI drill-collar OD × Bore ID make-up torque tables.
 */

/**
 * One snapped make-up torque per thread, so the same thread reads the same everywhere on the string.
 * Values are rounded to the nearest 500 ft·lbs from published API RP 7G / IADC drill-collar make-up
 * tables (4 1/2 REG ~22,000, 4 1/2 XH ~25,000, 4 1/2 IF ~35,000). They are approximations for the
 * preview, not a substitute for the manufacturer's chart.
 */
const SNAPPED_TORQUE = {
  "4 1/2 REG": { ftLbs: 22000, kNm: 30 },
  "4 1/2 XH": { ftLbs: 25000, kNm: 34 },
  "4 1/2 IF": { ftLbs: 35000, kNm: 47 },
};

export function apiMakeUpTorque(thread) {
  const spec = SNAPPED_TORQUE[thread];
  return spec ? { ...spec } : null;
}
const RAW_BHA = [
  {
    key: "bit",
    name: "Bit",
    lengthM: 0.35,
    odMm: 216,
    idMm: 57,
    topThread: "—",
    btmThread: "4 1/2 REG",
    art: "Bit",
  },
  {
    key: "motor",
    name: "Motor",
    lengthM: 9.42,
    odMm: 171,
    idMm: 71,
    topThread: "4 1/2 REG",
    btmThread: "4 1/2 XH",
    art: "Motor",
  },
  {
    key: "stab",
    name: "Stabilized Sub",
    lengthM: 1.52,
    odMm: 172,
    idMm: 71,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 XH",
    art: "StabSub",
  },
  {
    key: "pony",
    name: "NM Pony",
    lengthM: 1.2,
    odMm: 169,
    idMm: 71,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 XH",
    art: "NMPony",
  },
  {
    key: "mwd",
    name: "MWD Carrier",
    lengthM: 2.44,
    odMm: 171,
    idMm: 76,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 XH",
    art: "MWDCarrier",
  },
  {
    key: "flex-a",
    name: "NM Flex Monel",
    lengthM: 9.3,
    odMm: 170,
    idMm: 71,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 XH",
    art: "NMFlex",
  },
  {
    key: "flex-b",
    name: "NM Flex Monel",
    lengthM: 9.3,
    odMm: 169,
    idMm: 71,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 XH",
    art: "NMFlex",
  },
  {
    key: "xo",
    name: "Subs - X-Over",
    lengthM: 0.82,
    odMm: 170,
    idMm: 57,
    topThread: "4 1/2 XH",
    btmThread: "4 1/2 IF",
    art: "Subs",
  },
  {
    key: "exciter",
    name: "Exciter / Agitator",
    lengthM: 5.45,
    odMm: 169,
    idMm: 51,
    topThread: "4 1/2 IF",
    btmThread: "4 1/2 IF",
    art: "Exciter",
  },
  {
    key: "shock",
    name: "Shock Sub",
    lengthM: 5.68,
    odMm: 171,
    idMm: 57,
    topThread: "4 1/2 IF",
    btmThread: "4 1/2 IF",
    art: "ShockSub",
  },
  {
    key: "jars",
    name: "Jars",
    jarSpecs: "UP 48K DN 22K SEC 39",
    lengthM: 6.35,
    odMm: 170,
    idMm: 57,
    topThread: "4 1/2 IF",
    btmThread: "4 1/2 IF",
    art: "Jars",
  },
];

export const BHA_BUILD = RAW_BHA.map((piece) => {
  // For Motor TOP (4 1/2 REG bit box), the bit-box bore matches the 57 mm bit pin.
  const topIdMm = piece.key === "motor" && piece.topThread === "4 1/2 REG" ? 57 : piece.idMm;
  const topSpec = apiMakeUpTorque(piece.topThread, piece.odMm, topIdMm);
  const btmSpec = apiMakeUpTorque(piece.btmThread, piece.odMm, piece.idMm);
  const sameThread = piece.topThread === piece.btmThread;
  return {
    ...piece,
    sameThread,
    topTorqueKnm: topSpec ? topSpec.kNm : null,
    topTorqueFtLbs: topSpec ? topSpec.ftLbs : null,
    btmTorqueKnm: btmSpec ? btmSpec.kNm : null,
    btmTorqueFtLbs: btmSpec ? btmSpec.ftLbs : null,
  };
});

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

/**
 * Additive total length plus detected minimum and maximum common metrics (OD and ID in mm)
 * after each piece is added to the single-column BHA.
 */
export function bhaProgress(pieces = BHA_BUILD) {
  let lengthM = 0;
  let largestOd = 0;
  let smallestOd = Infinity;
  let smallestId = Infinity;
  let largestId = 0;
  let maxOdKey = "";
  let minOdKey = "";
  let minIdKey = "";
  let maxIdKey = "";

  return pieces.map((piece, index) => {
    const prevLengthM = lengthM;
    lengthM = round3(lengthM + piece.lengthM);
    if (piece.odMm > largestOd) {
      largestOd = piece.odMm;
      maxOdKey = piece.key;
    }
    if (piece.odMm < smallestOd) {
      smallestOd = piece.odMm;
      minOdKey = piece.key;
    }
    if (piece.idMm < smallestId) {
      smallestId = piece.idMm;
      minIdKey = piece.key;
    }
    if (piece.idMm > largestId) {
      largestId = piece.idMm;
      maxIdKey = piece.key;
    }
    return {
      ...piece,
      stepNumber: index + 1,
      prevLengthM,
      totalLengthM: lengthM,
      largestOdMm: largestOd,
      maxOdMm: largestOd,
      minOdMm: smallestOd,
      minIdMm: smallestId,
      maxIdMm: largestId,
      maxOdKey,
      minOdKey,
      minIdKey,
      maxIdKey,
    };
  });
}

