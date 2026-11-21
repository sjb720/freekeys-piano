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
