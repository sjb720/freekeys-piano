# Audio — `src/renderer/audio/`

| Name                                                   | Signature                        | Description                                                                        |
| ------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------- |
| `getAudioContext`                                      | `() => AudioContext`             | Shared interactive-latency context.                                                |
| `PianoSampler`                                         | class                            | Salamander samples every minor third (A0–C8), pitch-shifted to the nearest note.   |
| `.load()`                                              | `() => Promise<void>`            | Fetches and decodes `audio/piano/<midi>.mp3` (renderer `public/`).                 |
| `.play(pitch, velocity, when, duration)`               |                                  | Schedules a note at AudioContext time `when`, with release after `duration`.       |
| `.stopAll()`                                           |                                  | Quick fade on every sounding or scheduled voice.                                   |
| `.setVolume(v)`                                        | `0..1`                           | Master gain.                                                                       |
| `.noteOn(pitch, velocity)`                             | `=> release() \| null`           | Starts a note now; call `release` to let it go. Used for touch input.              |
| `.output`                                              | `GainNode`                       | Master output, shared with the metronome.                                          |
| `Metronome`                                            | `new (ctx, output)`              | `click(when, accent)` plays a short synthesized click (higher pitch on downbeats). |
| `loadPianoSampler`                                     | `(ctx) => Promise<PianoSampler>` | Loads once per app; retries after failure.                                         |
| `nearestSample` / `playbackRateFor` / `SAMPLE_PITCHES` |                                  | Sample selection math.                                                             |

Samples: `src/renderer/public/audio/piano/` (CC-BY 3.0, see its `LICENSE.md`).
