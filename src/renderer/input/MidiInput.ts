import { inputHub, type InputHub } from './InputHub';
import { parseMidiMessage } from './midiMessage';

export type MidiDevice = { id: string; name: string };

export const ALL_DEVICES = 'all';

export class MidiInput {
  private access: MIDIAccess | null = null;
  private deviceId = ALL_DEVICES;
  private devices: MidiDevice[] = [];
  private listeners = new Set<() => void>();
  private starting: Promise<void> | null = null;

  constructor(private readonly hub: InputHub) {}

  start(): Promise<void> {
    this.starting ??= navigator
      .requestMIDIAccess()
      .then((access) => {
        this.access = access;
        access.onstatechange = () => this.refresh();
        this.refresh();
      })
      .catch(() => {
        this.starting = null;
      });
    return this.starting;
  }

  setDevice(id: string): void {
    this.deviceId = id;
    this.refresh();
  }

  getDevices = (): MidiDevice[] => this.devices;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private refresh(): void {
    if (!this.access) return;
    const inputs = [...this.access.inputs.values()].filter((i) => i.state === 'connected');

    for (const input of inputs) {
      const listening = this.deviceId === ALL_DEVICES || input.id === this.deviceId;
      input.onmidimessage = listening ? this.onMessage : null;
    }

    const next = inputs.map((i) => ({ id: i.id, name: i.name ?? 'MIDI device' }));
    const changed =
      next.length !== this.devices.length || next.some((d, i) => d.id !== this.devices[i]?.id);
    if (!changed) return;

    this.devices = next;
    this.hub.releaseSource('midi');
    for (const listener of this.listeners) listener();
  }

  private onMessage = (event: MIDIMessageEvent): void => {
    const message = parseMidiMessage(event.data);
    if (message) this.hub.emit({ ...message, source: 'midi' });
  };
}

export const midiInput = new MidiInput(inputHub);
