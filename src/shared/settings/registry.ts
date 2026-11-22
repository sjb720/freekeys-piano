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

export const HAND_FOCUSES = ['left', 'both', 'right'] as const;
export type HandFocus = (typeof HAND_FOCUSES)[number];

export const HAND_FOCUS_LABELS: Record<HandFocus, string> = {
  left: 'Left',
  both: 'Both',
  right: 'Right',
};

export const KEY_LABEL_MODES = ['off', 'c', 'white', 'all'] as const;
export type KeyLabelMode = (typeof KEY_LABEL_MODES)[number];

export const OTHER_HAND_MODES = ['play', 'mute'] as const;
export type OtherHandMode = (typeof OTHER_HAND_MODES)[number];

export const PEDAL_CONTROLS = ['off', 'sustain', 'soft'] as const;
export type PedalControl = (typeof PEDAL_CONTROLS)[number];

export const SETTINGS = {
  theme: {
    layer: 'profile',
    section: 'Appearance',
    label: 'Theme',
    default: 'dark',
    control: { type: 'theme' },
  },
  keyLabels: {
    layer: 'profile',
    section: 'Appearance',
    label: 'Key labels',
    description: 'Note letters on the on-screen keyboard. C keys show their octave, like C4.',
    default: 'c' as KeyLabelMode,
    control: {
      type: 'segmented',
      options: [
        { value: 'off', label: 'Off' },
        { value: 'c', label: 'C only' },
        { value: 'white', label: 'White keys' },
        { value: 'all', label: 'All keys' },
      ],
    },
  },
  noteLabels: {
    layer: 'profile',
    section: 'Appearance',
    label: 'Note names on falling notes',
    description: 'Shows the letter (A, C#) on notes big enough to fit it.',
    default: false,
    control: { type: 'toggle' },
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
  otherHand: {
    layer: 'profile',
    section: 'Practice',
    label: 'Other hand',
    description: 'When practicing one hand, the app can play the other hand for you.',
    default: 'play' as OtherHandMode,
    control: {
      type: 'segmented',
      options: [
        { value: 'play', label: 'Play it' },
        { value: 'mute', label: 'Mute it' },
      ],
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
  pedalControl: {
    layer: 'app',
    section: 'Input',
    label: 'Pedal controls playback',
    description:
      'Tap the pedal to play or pause. Double-tap to restart the loop, or the song if there is no loop. The pedal still works on your keyboard’s own sound.',
    default: 'off' as PedalControl,
    control: {
      type: 'segmented',
      options: [
        { value: 'off', label: 'Off' },
        { value: 'sustain', label: 'Sustain (right)' },
        { value: 'soft', label: 'Soft (left)' },
      ],
    },
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

export function isValidSettingValue(
  key: string,
  value: unknown,
): value is SettingValues[SettingKey] {
  if (!(key in SETTINGS)) return false;
  const def: SettingDef = SETTINGS[key as SettingKey];
  if (typeof value !== typeof def.default) return false;
  const { control } = def;
  if (control.type === 'segmented') return control.options.some((o) => o.value === value);
  if (control.type === 'slider') {
    return (
      Number.isFinite(value) && (value as number) >= control.min && (value as number) <= control.max
    );
  }
  return true;
}

export const settingKeysFor = (layer: SettingLayer) =>
  SETTING_KEYS.filter((k) => SETTINGS[k].layer === layer);
