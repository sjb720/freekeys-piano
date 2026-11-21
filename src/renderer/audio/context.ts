let context: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  context ??= new AudioContext({ latencyHint: 'interactive' });
  return context;
}
