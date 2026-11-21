export type SettingLayer = 'app' | 'profile';

export type SettingControl =
  | { type: 'slider'; min: number; max: number; step: number; format: 'percent' | 'seconds' }
  | { type: 'segmented'; options: readonly { value: string; label: string }[] }
  | { type: 'toggle' }
  | { type: 'theme' }
  | { type: 'midiDevice' };

export type SettingDef = {
  layer: SettingLayer;
  section: string;
  label: string;
  description?: string;
  default: unknown;
  control: SettingControl;
};

export const SETTING_SECTIONS = ['Appearance', 'Practice', 'Playback', 'Input', 'Audio'] as const;

export const PRACTICE_MODES = ['watch', 'playAlong', 'wait'] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  watch: 'Watch',
  playAlong: 'Play along',
  wait: 'Wait',
};

export const SETTINGS = {
  theme: {
    layer: 'profile',
    section: 'Appearance',
    label: 'Theme',
    default: 'dark',
    control: { type: 'theme' },
  },
  practiceMode: {
    layer: 'profile',
    section: 'Practice',
    label: 'Default mode',
    description:
      'Wait pauses at each note until you play it. Play along keeps going and scores you.',
    default: 'wait' as PracticeMode,
    control: {
      type: 'segmented',
      options: PRACTICE_MODES.map((value) => ({ value, label: PRACTICE_MODE_LABELS[value] })),
    },
  },
  metronome: {
    layer: 'profile',
    section: 'Practice',
    label: 'Metronome',
    default: false,
    control: { type: 'toggle' },
  },
  noteFallTime: {
    layer: 'profile',
    section: 'Playback',
    label: 'Note fall time',
    description: 'How long a note takes to reach the keyboard. Higher is easier to read.',
    default: 3,
    control: { type: 'slider', min: 1, max: 8, step: 0.5, format: 'seconds' },
  },
  midiInput: {
    layer: 'app',
    section: 'Input',
    label: 'MIDI keyboard',
    description: 'Which connected MIDI device to listen to.',
    default: 'all',
    control: { type: 'midiDevice' },
  },
  volume: {
    layer: 'app',
    section: 'Audio',
    label: 'Volume',
    default: 0.8,
    control: { type: 'slider', min: 0, max: 1, step: 0.05, format: 'percent' },
  },
} satisfies Record<string, SettingDef & { section: (typeof SETTING_SECTIONS)[number] }>;

export type SettingKey = keyof typeof SETTINGS;
export type SettingValue<K extends SettingKey> = (typeof SETTINGS)[K]['default'];
export type SettingValues = { [K in SettingKey]: SettingValue<K> };

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

export function defaultSettings(): SettingValues {
  return Object.fromEntries(SETTING_KEYS.map((k) => [k, SETTINGS[k].default])) as SettingValues;
}

export function formatSettingValue(control: SettingControl, value: unknown): string {
  if (control.type === 'toggle') return value ? 'On' : 'Off';
  if (control.type !== 'slider' || typeof value !== 'number') return String(value);
  return control.format === 'percent' ? `${Math.round(value * 100)}%` : `${value} s`;
}
