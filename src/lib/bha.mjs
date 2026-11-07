/** Inventory-workflow preview. Bit first, then up the string. Two NM Flex Monels. */

export const BHA_BUILD = [
  { key: "bit", name: "Bit", lengthM: 0.35, odIn: 6.125, art: "Bit" },
  { key: "motor", name: "Motor", lengthM: 9.42, odIn: 6.75, art: "Motor" },
  { key: "stab", name: "Stabilized Sub", lengthM: 1.52, odIn: 8.5, art: "StabSub" },
  { key: "pony", name: "NM Pony", lengthM: 1.2, odIn: 4.75, art: "NMPony" },
  { key: "mwd", name: "MWD Carrier", lengthM: 2.44, odIn: 4.75, art: "MWDCarrier" },
  { key: "flex-a", name: "NM Flex Monel", lengthM: 9.3, odIn: 4.75, art: "NMFlex" },
  { key: "flex-b", name: "NM Flex Monel", lengthM: 9.3, odIn: 4.75, art: "NMFlex" },
  { key: "xo", name: "Subs", lengthM: 0.82, odIn: 6.5, art: "Subs" },
  { key: "exciter", name: "Exciter / Agitator", lengthM: 1.15, odIn: 5.25, art: "Exciter" },
  { key: "shock", name: "Shock Sub", lengthM: 1.48, odIn: 6.75, art: "ShockSub" },
  { key: "jars", name: "Jars", lengthM: 4.05, odIn: 4.75, art: "Jars" },
];

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

/** Cumulative length and largest OD after each piece is added. */
export function bhaProgress(pieces = BHA_BUILD) {
  let lengthM = 0;
  let largestOd = 0;
  return pieces.map((piece) => {
    lengthM = round3(lengthM + piece.lengthM);
    largestOd = Math.max(largestOd, piece.odIn);
    return { ...piece, totalLengthM: lengthM, largestOdIn: largestOd };
  });
}
