import type {
  InputSourceKind,
  NoteInputEvent,
  NoteInputListener,
  PedalInputEvent,
  PedalInputListener,
} from './types';

export class InputHub {
  private listeners = new Set<NoteInputListener>();
  private held = new Map<number, InputSourceKind>();
  private pedalListeners = new Set<PedalInputListener>();

  subscribe = (listener: NoteInputListener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  emit(event: NoteInputEvent): void {
    if (event.type === 'on') this.held.set(event.pitch, event.source);
    else if (!this.held.has(event.pitch)) return;
    else this.held.delete(event.pitch);
    for (const listener of this.listeners) listener(event);
  }

  subscribePedal = (listener: PedalInputListener): (() => void) => {
    this.pedalListeners.add(listener);
    return () => this.pedalListeners.delete(listener);
  };

  emitPedal(event: PedalInputEvent): void {
    for (const listener of this.pedalListeners) listener(event);
  }

  heldNotes(): ReadonlyMap<number, InputSourceKind> {
    return this.held;
  }

  releaseSource(source: InputSourceKind): void {
    for (const [pitch, from] of [...this.held]) {
      if (from === source) this.emit({ type: 'off', pitch, velocity: 0, source });
    }
  }
}

export const inputHub = new InputHub();
