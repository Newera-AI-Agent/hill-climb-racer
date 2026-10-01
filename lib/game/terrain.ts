// Procedural terrain: layered sine/noise hills, infinite to the right,
// plus deterministic placement of coins and fuel canisters.

export interface HeightFn {
  (x: number): number;
}

/** Deterministic pseudo-random from an integer seed (mulberry-ish). */
export function hash1(n: number): number {
  let h = (n | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Smooth value noise at x (in "cells" of size `cell`). */
export function valueNoise(x: number, cell: number, seed: number): number {
  const gx = x / cell;
  const i0 = Math.floor(gx);
  const t = gx - i0;
  const s = t * t * (3 - 2 * t);
  const a = hash1(i0 + seed * 7919);
  const b = hash1(i0 + 1 + seed * 7919);
  return a + (b - a) * s;
}

/**
 * Height of the ground at world x (pixels). y grows downward in canvas,
 * so larger returned value = lower ground. Base ~ 0 means "sea level";
 * we return a vertical world coordinate used by physics & renderer.
 */
export function makeHeightFn(): HeightFn {
  return (x: number) => {
    const d = Math.max(0, x);
    // Flat launch pad for the first 600px so the run starts gently.
    const ramp = Math.min(1, d / 600);
    const ease = ramp * ramp * (3 - 2 * ramp);
    const hills =
      Math.sin(d * 0.004) * 90 +
      Math.sin(d * 0.0013 + 1.7) * 160 +
      valueNoise(d, 260, 1) * 120 +
      valueNoise(d, 90, 2) * 40;
    return 520 - ease * hills; // world Y of ground surface
  };
}

export type PickupType = 'coin' | 'fuel';

export interface Pickup {
  id: number;
  type: PickupType;
  x: number;
  y: number;
  taken: boolean;
}

const COIN_SPACING = 130;
const FUEL_SPACING = 1600;
const COINS_PER_CLUSTER = 5;

/**
 * Deterministic pickup layout as a function of world position.
 * We only materialize pickups inside a sliding window around the car.
 */
export function pickupsInRange(
  height: HeightFn,
  minX: number,
  maxX: number,
): Pickup[] {
  const out: Pickup[] = [];
  const i0 = Math.max(4, Math.floor(minX / COIN_SPACING));
  const i1 = Math.ceil(maxX / COIN_SPACING);
  for (let i = i0; i <= i1; i++) {
    // cluster index every COINS_PER_CLUSTER slots, skipping some clusters
    if (i % COINS_PER_CLUSTER !== 0) continue;
    const skip = hash1(i * 31 + 7);
    if (skip < 0.25) continue;
    const baseX = i * COIN_SPACING;
    // arc of coins following terrain
    for (let k = 0; k < 5; k++) {
      const x = baseX + k * 34;
      const gy = height(x);
      const lift = 56 + Math.sin((k / 4) * Math.PI) * 34;
      out.push({ id: i * 10 + k, type: 'coin', x, y: gy - lift, taken: false });
    }
  }
  const f0 = Math.max(1, Math.floor(minX / FUEL_SPACING));
  const f1 = Math.ceil(maxX / FUEL_SPACING);
  for (let i = f0; i <= f1; i++) {
    const jitter = hash1(i * 101 + 13) * 400 - 200;
    const x = i * FUEL_SPACING + jitter;
    out.push({ id: 1_000_000 + i, type: 'fuel', x, y: height(x) - 26, taken: false });
  }
  return out;
}
