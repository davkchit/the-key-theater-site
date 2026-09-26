// One character of motion for the whole page (see the apple-design notes):
// critically damped, no overshoot, ~0.4 s to settle. A little bounce only
// where a finger threw something (a flick in the gallery).
export const SPRING = { type: 'spring', bounce: 0, duration: 0.4 } as const
export const SPRING_FLICK = { type: 'spring', bounce: 0.2, duration: 0.45 } as const
