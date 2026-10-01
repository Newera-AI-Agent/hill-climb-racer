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
export interface Scene {
  cam: Camera;
  height: (x: number) => number;
  pickups: Pickup[];
  car: VehicleState;
  time: number;
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: Scene
){
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#5ab0f0');
  sky.addColorStop(0.55, '#a9d9f7');
  sky.addColorStop(1, '#e8f6fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffe46b';
  ctx.beginPath();
  ctx.arc(W - 90, 78, 40, 0, Math.PI * 2);
  ctx.fill();
}
function drawClouds(ctx: CanvasRenderingContext2D, camX: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const c of cloudsNear(camX)) {
    const x = c.x - camX * 0.25;
    ctx.beginPath();
    ctx.arc(x, c.y, c.s, 0, Math.PI * 2);
    ctx.arc(x + c.s * 0.9, c.y + 6, c.s * 0.75, 0, Math.PI * 2);
    ctx.arc(x - c.s, c.y + 10, c.s * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}
function hillLayer(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  camX: number,
  par: number,
  base: number,
  amp: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let px = 0; px <= W; px += 8) {
    const wx = px + camX * par;
    const y = base + Math.sin(wx * 0.0021) * amp + Math.sin(wx * 0.0009 + 2) * amp * 0.8;
    ctx.lineTo(px, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}
function drawTerrain(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cam: Camera,
  height: (x: number) => number
) {
  const t = 0.3 * W;
  const toY = (wy: number) => H / 2 + (wy - cam.y);
  const pts: number[] = [];
  for (let s…(361 chars)