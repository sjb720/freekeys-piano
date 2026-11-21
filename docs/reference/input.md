# Input — `src/renderer/input/`

Every source emits `NoteInputEvent { type: 'on'|'off', pitch, velocity (0..1), source: 'midi'|'touch'|'mic' }` into one hub. Consumers never care which source produced an event.

| Name                                        | Signature                              | Description                                                                               |
| ------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `inputHub`                                  | `InputHub` singleton                   | App-wide event bus.                                                                       |
| `InputHub.emit(event)`                      |                                        | Tracks held notes. Drops note-off for notes that aren't held.                             |
| `InputHub.subscribe(fn)`                    | `=> unsubscribe`                       |                                                                                           |
| `InputHub.heldNotes()`                      | `ReadonlyMap<pitch, source>`           |                                                                                           |
| `InputHub.releaseSource(source)`            |                                        | Emits note-off for every held note from that source (e.g. device unplugged, page left).   |
| `midiInput`                                 | `MidiInput` singleton                  | Web MIDI source. `start()` requests access once; hot-plug via `onstatechange`.            |
| `MidiInput.setDevice(id)`                   | `'all'` or device id                   | Which inputs to listen to.                                                                |
| `MidiInput.getDevices()` / `.subscribe(fn)` |                                        | Connected devices, for `useSyncExternalStore`.                                            |
| `parseMidiMessage(data)`                    | `=> { type, pitch, velocity } \| null` | Note on/off on any channel; velocity-0 note-on counts as off. Everything else is ignored. |
| `useMidiInputSync()`                        | hook                                   | Starts MIDI and applies the `midiInput` setting. Mounted once in `App`.                   |
| `useMidiDevices()`                          | `=> MidiDevice[]`                      |                                                                                           |

Touch input comes from `PianoKeyboard` in the scene, which `SongStage` forwards to `inputHub` with `source: 'touch'`. Touch notes also sound through the sampler; MIDI notes don't, because the keyboard makes its own sound.

Electron only grants the `midi` permission (`src/main/permissions.ts`).
