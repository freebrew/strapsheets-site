/**
 * Inventory-workflow preview. Vertical BHA torqued together from Bit (01) through Jars (11).
 * All OD/ID in mm, lengths in m, and make-up torque specs in both kN·m and ft·lbs
 * derived from API RP 7G / IADC and Command-SMFI drill-collar OD × Bore ID make-up torque tables.
 */

const KNM_PER_FTLB = 0.001355818;

/**
 * Verified API RP 7G / IADC & Command-SMFI recommended minimum make-up torque (ft·lbs and kN·m)
 * as a function of thread connection, outside diameter (odMm), and bore inside diameter (idMm).
 *
 * Reference anchors (API RP 7G Table / Evolution Drilling & Command-SMFI Drill Collar Tables):
 *   - 4 1/2 REG (OD 152–172 mm):
 *       ID 51 mm (2"):       23,686 ft·lbs (32.1 kN·m)
 *       ID 57 mm (2 1/4"):   21,749 ft·lbs (29.5 kN·m)
 *       ID 63.5 mm (2 1/2"): 19,601 ft·lbs (26.6 kN·m)
 *       ID 71 mm (2 13/16"): 16,629 ft·lbs (22.5 kN·m)
 *   - 4 1/2 XH / API NC46 (OD 159–172 mm, pin-tension governed):
 *       ID 57 mm (2 1/4"):   28,021 ft·lbs (38.0 kN·m)
 *       ID 63.5 mm (2 1/2"): 25,676 ft·lbs (34.8 kN·m)
 *       ID 71 mm (2 13/16"): 22,426 ft·lbs (30.4 kN·m)
 *       ID 76 mm (3"):       20,311 ft·lbs (27.5 kN·m)
 *   - 4 1/2 IF / API NC50 (OD 165.1–171.5 mm, combined box-bucking & pin-tension curve):
 *       OD 169 mm (6.65"), ID 51 mm (2"):     33,900 ft·lbs (46.0 kN·m)
 *       OD 170 mm (6.69"), ID 57 mm (2 1/4"): 35,100 ft·lbs (47.6 kN·m)
 *       OD 171 mm (6.73"), ID 57 mm (2 1/4"): 35,824 ft·lbs (48.6 kN·m)
 */
export function apiMakeUpTorque(thread, odMm, idMm) {
  if (!thread || thread === "—") return null;

  let ftLbs = 0;
  if (thread === "4 1/2 REG") {
    if (idMm <= 51) ftLbs = 23690;
    else if (idMm <= 57) ftLbs = 21750;
    else if (idMm <= 64) ftLbs = 19600;
    else ftLbs = 16630;
  } else if (thread === "4 1/2 XH") {
    // API NC46: pin wall thickness (controlled by ID) governs above 159 mm (6 1/4") OD,
    // with slight collar OD seating adjustment across 169–172 mm.
    if (idMm <= 57) ftLbs = 28020;
    else if (idMm <= 64) ftLbs = 25680;
    else if (idMm <= 71) {
      ftLbs = odMm >= 172 ? 22550 : odMm === 171 ? 22430 : odMm === 170 ? 22310 : 22190;
    } else {
      ftLbs = 20310;
    }
  } else if (thread === "4 1/2 IF") {
    // API NC50: between 6 1/2" (165.1 mm, 29,679 ft·lbs) and 6 3/4" (171.5 mm, 36,742 / 35,824 ft·lbs)
    // box wall thickness and bore ID both govern.
    if (odMm <= 169 && idMm <= 51) ftLbs = 33900;
    else if (odMm === 170 && idMm <= 57) ftLbs = 35100;
    else if (odMm >= 171 && idMm <= 57) ftLbs = 35820;
    else ftLbs = 32280;
  } else {
    return null;
  }

  const kNm = Math.round(ftLbs * KNM_PER_FTLB * 10) / 10;
  return { ftLbs, kNm };
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
