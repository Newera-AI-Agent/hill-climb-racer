import type { Pickup } from './terrain';
import type { VehicleState } from './vehicle';

export interface Camera {
  x: number;
  y: number;
}
function hash1(n: number): number {
  let h = (n | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
interface Cloud { x: number; y: number; s: number }

function cloudsNear(camX: number): Cloud[] {
  const out: Cloud[] = [];
  const base = Math.floor(camX / 380);
  for (let i = base; i < base + 8; i++) {
    out.push({
      x: i * 380 + hash1(i * 7 + 3) * 260,
      y: 60 + hash1(i * 13 + 5) * 130,
      s: 26 + hash1(i * 17 + 11) * 30,
    });
  }
  return out;
}
