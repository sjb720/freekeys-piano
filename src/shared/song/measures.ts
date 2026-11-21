export type TickTimeSignature = { ticks: number; numerator: number; denominator: number };

export function measureStartTicks(
  signatures: TickTimeSignature[],
  endTicks: number,
  ppq: number,
): number[] {
  const sigs = [...signatures].sort((a, b) => a.ticks - b.ticks);
  if (sigs[0]?.ticks !== 0) sigs.unshift({ ticks: 0, numerator: 4, denominator: 4 });

  const starts: number[] = [];
  sigs.forEach((sig, i) => {
    const until = sigs[i + 1]?.ticks ?? endTicks;
    const length = (ppq * 4 * sig.numerator) / sig.denominator;
    for (let t = sig.ticks; t < until; t += length) starts.push(t);
  });
  return starts;
}

export type TickBeat = { ticks: number; downbeat: boolean };

export function beatTicks(
  signatures: TickTimeSignature[],
  endTicks: number,
  ppq: number,
): TickBeat[] {
  const sigs = [...signatures].sort((a, b) => a.ticks - b.ticks);
  if (sigs[0]?.ticks !== 0) sigs.unshift({ ticks: 0, numerator: 4, denominator: 4 });

  const beats: TickBeat[] = [];
  sigs.forEach((sig, i) => {
    const until = sigs[i + 1]?.ticks ?? endTicks;
    const length = (ppq * 4) / sig.denominator;
    for (let t = sig.ticks, n = 0; t < until; t += length, n++) {
      beats.push({ ticks: t, downbeat: n % sig.numerator === 0 });
    }
  });
  return beats;
}
