/** Inventory-workflow preview. Bit first, then up the string. Two NM Flex Monels. */

export const BHA_BUILD = [
  { key: "bit", name: "Bit", lengthM: 0.35, odIn: 8.5, idIn: 2.25, art: "Bit" },
  { key: "motor", name: "Motor", lengthM: 9.42, odIn: 6.75, idIn: 2.81, art: "Motor" },
  { key: "stab", name: "Stabilized Sub", lengthM: 1.52, odIn: 6.78, idIn: 2.81, art: "StabSub" },
  { key: "pony", name: "NM Pony", lengthM: 1.2, odIn: 6.65, idIn: 2.81, art: "NMPony" },
  { key: "mwd", name: "MWD Carrier", lengthM: 2.44, odIn: 6.72, idIn: 3.0, art: "MWDCarrier" },
  { key: "flex-a", name: "NM Flex Monel", lengthM: 9.3, odIn: 6.69, idIn: 2.81, art: "NMFlex" },
  { key: "flex-b", name: "NM Flex Monel", lengthM: 9.3, odIn: 6.68, idIn: 2.81, art: "NMFlex" },
  { key: "xo", name: "Subs", lengthM: 0.82, odIn: 6.71, idIn: 2.25, art: "Subs" },
  { key: "exciter", name: "Exciter / Agitator", lengthM: 1.15, odIn: 6.66, idIn: 2.0, art: "Exciter" },
  { key: "shock", name: "Shock Sub", lengthM: 1.48, odIn: 6.74, idIn: 2.25, art: "ShockSub" },
  { key: "jars", name: "Jars", lengthM: 4.05, odIn: 6.67, idIn: 2.25, art: "Jars" },
];

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

/**
 * Additive total length plus detected minimum and maximum common metrics (OD and ID)
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
    if (piece.odIn > largestOd) {
      largestOd = piece.odIn;
      maxOdKey = piece.key;
    }
    if (piece.odIn < smallestOd) {
      smallestOd = piece.odIn;
      minOdKey = piece.key;
    }
    if (piece.idIn < smallestId) {
      smallestId = piece.idIn;
      minIdKey = piece.key;
    }
    if (piece.idIn > largestId) {
      largestId = piece.idIn;
      maxIdKey = piece.key;
    }
    return {
      ...piece,
      stepNumber: index + 1,
      prevLengthM,
      totalLengthM: lengthM,
      largestOdIn: largestOd,
      maxOdIn: largestOd,
      minOdIn: smallestOd,
      minIdIn: smallestId,
      maxIdIn: largestId,
      maxOdKey,
      minOdKey,
      minIdKey,
      maxIdKey,
    };
  });
}
