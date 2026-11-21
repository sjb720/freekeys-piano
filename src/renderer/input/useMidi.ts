import { useEffect, useSyncExternalStore } from 'react';
import { useSetting } from '@renderer/state/settingsStore';
import { midiInput, type MidiDevice } from './MidiInput';

export function useMidiDevices(): MidiDevice[] {
  return useSyncExternalStore(midiInput.subscribe, midiInput.getDevices);
}

export function useMidiInputSync(): void {
  const deviceId = useSetting('midiInput');
  useEffect(() => {
    void midiInput.start().then(() => midiInput.setDevice(deviceId));
  }, [deviceId]);
}
