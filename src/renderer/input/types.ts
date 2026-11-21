export type InputSourceKind = 'midi' | 'touch' | 'mic';

export type NoteInputEvent = {
  type: 'on' | 'off';
  pitch: number;
  velocity: number;
  source: InputSourceKind;
};

export type NoteInputListener = (event: NoteInputEvent) => void;
