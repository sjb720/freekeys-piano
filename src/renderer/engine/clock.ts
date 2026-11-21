export type Clock = { now(): number };

export const audioClock = (ctx: BaseAudioContext): Clock => ({ now: () => ctx.currentTime });
