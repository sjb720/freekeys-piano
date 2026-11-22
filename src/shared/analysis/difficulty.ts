import type { Song } from '../song';
import { handFeatures, handIndependence, type HandFeatures } from './features';

export const ANALYSIS_VERSION = 2;

type FeatureKey = Exclude<keyof HandFeatures, 'noteCount'>;

type Scale = { easy: number; hard: number; weight: number; label: string };

export const SCALES: Record<FeatureKey, Scale> = {
  peakRate: { easy: 1.5, hard: 12, weight: 0.24, label: 'Fast passages' },
  meanRate: { easy: 1, hard: 8, weight: 0.14, label: 'Sustained speed' },
  chordSize: { easy: 1, hard: 3, weight: 0.1, label: 'Chords' },
  maxPolyphony: { easy: 1, hard: 5, weight: 0.04, label: 'Big chords' },
  span: { easy: 0, hard: 12, weight: 0.1, label: 'Wide stretches' },
  leap: { easy: 2, hard: 19, weight: 0.15, label: 'Leaps' },
  range: { easy: 12, hard: 48, weight: 0.06, label: 'Wide range' },
  blackKeys: { easy: 0.05, hard: 0.5, weight: 0.07, label: 'Black keys' },
  offGrid: { easy: 0, hard: 0.5, weight: 0.1, label: 'Tricky rhythm' },
};

export type DifficultyFactor = {
  key: FeatureKey | 'independence';
  hand?: 'left' | 'right';
  label: string;
  impact: number;
};

export type HandDifficulty = { score: number; features: HandFeatures };

export type Difficulty = {
  version: number;
  score: number;
  level: number;
  left: HandDifficulty;
  right: HandDifficulty;
  independence: number;
  factors: DifficultyFactor[];
};

const INDEPENDENCE_BONUS = 12;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const normalize = (value: number, { easy, hard }: Scale) => clamp01((value - easy) / (hard - easy));

function contributions(features: HandFeatures): Record<FeatureKey, number> {
  const out = {} as Record<FeatureKey, number>;
  for (const key of Object.keys(SCALES) as FeatureKey[]) {
    out[key] = features.noteCount ? normalize(features[key], SCALES[key]) * SCALES[key].weight : 0;
  }
  return out;
}

const sum = (values: Record<string, number>) => Object.values(values).reduce((a, b) => a + b, 0);

export const levelFor = (score: number) => Math.min(10, Math.max(1, Math.ceil(score / 10)));

export function analyzeDifficulty(song: Pick<Song, 'notes' | 'beats'>): Difficulty {
  const byHand = (hand: 'left' | 'right') => song.notes.filter((n) => n.hand === hand);
  const leftFeatures = handFeatures(byHand('left'), song.beats);
  const rightFeatures = handFeatures(byHand('right'), song.beats);
  const leftParts = contributions(leftFeatures);
  const rightParts = contributions(rightFeatures);
  const left = sum(leftParts) * 100;
  const right = sum(rightParts) * 100;
  const independence = handIndependence(song.notes);

  const hardest = Math.max(left, right);
  const easiest = Math.min(left, right);
  const score = Math.min(100, 0.65 * hardest + 0.35 * easiest + independence * INDEPENDENCE_BONUS);

  const factors: DifficultyFactor[] = [
    ...(['left', 'right'] as const).flatMap((hand) =>
      (Object.entries(hand === 'left' ? leftParts : rightParts) as [FeatureKey, number][]).map(
        ([key, impact]) => ({ key, hand, label: SCALES[key].label, impact }),
      ),
    ),
    {
      key: 'independence',
      label: 'Independent hands',
      impact: (independence * INDEPENDENCE_BONUS) / 100,
    },
  ];

  return {
    version: ANALYSIS_VERSION,
    score: Math.round(score),
    level: levelFor(score),
    left: { score: Math.round(left), features: leftFeatures },
    right: { score: Math.round(right), features: rightFeatures },
    independence,
    factors: factors
      .filter((f) => f.impact >= 0.03)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 4),
  };
}
