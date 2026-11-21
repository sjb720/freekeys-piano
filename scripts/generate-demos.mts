import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import tonejs from '@tonejs/midi';

const { Midi } = tonejs;
const OUT = join(import.meta.dirname, '..', 'resources', 'songs');
const NOTE = /^([A-G])(#|b)?(\d)$/;
const STEPS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

type Event = [note: string | null, beats: number];

function pitch(name: string): number {
  const m = name.match(NOTE);
  if (!m) throw new Error(`Bad note ${name}`);
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (Number(m[3]) + 1) * 12 + STEPS[m[1]!]! + accidental;
}

function addLine(track: InstanceType<typeof Midi>['tracks'][number], line: Event[], bpm: number) {
  const beat = 60 / bpm;
  let t = 0;
  for (const [name, beats] of line) {
    if (name) {
      for (const n of name.split('+')) {
        track.addNote({
          midi: pitch(n),
          time: t * beat,
          duration: beats * beat * 0.95,
          velocity: 0.7,
        });
      }
    }
    t += beats;
  }
}

const seq = (notes: string, beats: number): Event[] =>
  notes.split(' ').map((n) => [n === '-' ? null : n, beats]);

function write(
  file: string,
  title: string,
  bpm: number,
  hands: { right: Event[]; left: Event[] },
  oneTrack = false,
) {
  const midi = new Midi();
  midi.name = title;
  midi.header.setTempo(bpm);
  if (oneTrack) {
    const track = midi.addTrack();
    track.name = 'Piano';
    addLine(track, hands.right, bpm);
    addLine(track, hands.left, bpm);
  } else {
    const rh = midi.addTrack();
    rh.name = 'Right Hand';
    addLine(rh, hands.right, bpm);
    const lh = midi.addTrack();
    lh.name = 'Left Hand';
    addLine(lh, hands.left, bpm);
  }
  writeFileSync(join(OUT, file), midi.toArray());
}

write('c-major-scale.mid', 'C Major Scale', 90, {
  right: seq('C4 D4 E4 F4 G4 A4 B4 C5 B4 A4 G4 F4 E4 D4 C4', 1).concat([[null, 1]]),
  left: seq('C3 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3', 1).concat([[null, 1]]),
});

const ode = [
  ...seq('E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4', 1),
  ['E4', 1.5],
  ['D4', 0.5],
  ['D4', 2],
  ...seq('E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4', 1),
  ['D4', 1.5],
  ['C4', 0.5],
  ['C4', 2],
] as Event[];
write('ode-to-joy.mid', 'Ode to Joy (Beethoven)', 100, {
  right: ode,
  left: [...seq('C3+G3 G2+G3 C3+G3 G2+F3 C3+G3 G2+G3 C3+G3', 4), ['G2+F3', 2], ['C3+E3', 2]],
});

const twinkleA = seq('C4 C4 G4 G4 A4 A4', 1).concat([['G4', 2]], seq('F4 F4 E4 E4 D4 D4', 1), [
  ['C4', 2],
]);
const twinkleB = seq('G4 G4 F4 F4 E4 E4', 1).concat([['D4', 2]]);
const lhA: Event[] = [
  ['C3', 4],
  ['F3', 2],
  ['C3', 2],
  ['F3', 2],
  ['C3', 2],
  ['G2', 2],
  ['C3', 2],
];
const lhB: Event[] = [
  ['C3', 2],
  ['F3', 2],
  ['C3', 2],
  ['G2', 2],
];
write(
  'twinkle-twinkle.mid',
  'Twinkle Twinkle Little Star',
  100,
  {
    right: [...twinkleA, ...twinkleB, ...twinkleB, ...twinkleA],
    left: [...lhA, ...lhB, ...lhB, ...lhA],
  },
  true,
);

console.log(`Wrote demos to ${OUT}`);
