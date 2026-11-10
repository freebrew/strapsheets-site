/**
 * Inventory-workflow preview. Vertical BHA torqued together from Bit (01) through Jars (11).
 * All OD/ID in mm, lengths in m, and industry make-up torque specs in kN·m.
 */

export const THREAD_TORQUE_KNM = {
  "4 1/2 REG": 24.4,
  "4 1/2 XH": 30.5,
  "4 1/2 IF": 38.6,
};

export const BHA_BUILD = [
  {
    key: "bit",
    name: "Bit",
    lengthM: 0.35,
    odMm: 216,
    idMm: 57,
    topThread: "—",
    topTorqueKnm: null,
    btmThread: "4 1/2 REG",
    btmTorqueKnm: 24.4,
    art: "Bit",
  },
  {
    key: "motor",
    name: "Motor",
    lengthM: 9.42,
    odMm: 171,
    idMm: 71,
    topThread: "4 1/2 REG",
    topTorqueKnm: 24.4,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "Motor",
  },
  {
    key: "stab",
    name: "Stabilized Sub",
    lengthM: 1.52,
    odMm: 172,
    idMm: 71,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "StabSub",
  },
  {
    key: "pony",
    name: "NM Pony",
    lengthM: 1.2,
    odMm: 169,
    idMm: 71,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "NMPony",
  },
  {
    key: "mwd",
    name: "MWD Carrier",
    lengthM: 2.44,
    odMm: 171,
    idMm: 76,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "MWDCarrier",
  },
  {
    key: "flex-a",
    name: "NM Flex Monel",
    lengthM: 9.3,
    odMm: 170,
    idMm: 71,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "NMFlex",
  },
  {
    key: "flex-b",
    name: "NM Flex Monel",
    lengthM: 9.3,
    odMm: 169,
    idMm: 71,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 XH",
    btmTorqueKnm: 30.5,
    art: "NMFlex",
  },
  {
    key: "xo",
    name: "Subs - X-Over",
    lengthM: 0.82,
    odMm: 170,
    idMm: 57,
    topThread: "4 1/2 XH",
    topTorqueKnm: 30.5,
    btmThread: "4 1/2 IF",
    btmTorqueKnm: 38.6,
    art: "Subs",
  },
  {
    key: "exciter",
    name: "Exciter / Agitator",
    lengthM: 5.45,
    odMm: 169,
    idMm: 51,
    topThread: "4 1/2 IF",
    topTorqueKnm: 38.6,
    btmThread: "4 1/2 IF",
    btmTorqueKnm: 38.6,
    art: "Exciter",
  },
  {
    key: "shock",
    name: "Shock Sub",
    lengthM: 5.68,
    odMm: 171,
    idMm: 57,
    topThread: "4 1/2 IF",
    topTorqueKnm: 38.6,
    btmThread: "4 1/2 IF",
    btmTorqueKnm: 38.6,
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
    topTorqueKnm: 38.6,
    btmThread: "4 1/2 IF",
    btmTorqueKnm: 38.6,
    art: "Jars",
  },
];

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
