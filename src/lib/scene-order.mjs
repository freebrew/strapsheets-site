/** Supporting scenes play once, in reading order. The BHA preview leads. */

let bhaComplete = false;
const waiting = [];

export function markBhaComplete() {
  bhaComplete = true;
  const queued = waiting.splice(0);
  for (const resolve of queued) resolve();
}

export function whenBhaComplete(timeoutMs = 12000) {
  if (bhaComplete) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    waiting.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}
