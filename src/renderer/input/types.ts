export type InputSourceKind = 'midi' | 'touch' | 'mic';

export type NoteInputEvent = {
  type: 'on' | 'off';
  pitch: number;
  velocity: number;
  source: InputSourceKind;
};

export type NoteInputListener = (event: NoteInputEvent) => void;

export type PedalKind = 'sustain' | 'sostenuto' | 'soft';

export type PedalInputEvent = { pedal: PedalKind; down: boolean; source: InputSourceKind };

export type PedalInputListener = (event: PedalInputEvent) => void;
