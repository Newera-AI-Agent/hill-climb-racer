import { heightAt } from './terrain';
import type { VehicleState } from './vehicle';
import type { Camera, LevelConfig } from './types';

const CAR: Record<string,[string,string]> = {
  red: ['#e63946', '#9d1d2a'],
  blue: ['#457b9d', '#1d3557'],
  green: ['#2a9d8f', '#175e54'],
};

interface Pal { sky: string[]; far: string; mid: string; dirt: string; grass: string }

const PAL: Record<string, Pal> = {
  meadow: { sky: ['#7ec8e3', '#dff3fa'], far: '#a8c3d1', mid: '#7f9b7e', dirt: '#8b6b4a', grass: '#4cab35' },
  dusk: { sky: ['#2b1055', '#ff758f'], far: '#4a2c6d', mid: '#5c3a5e', dirt: '#6b4a3a', grass: '#c98f3d' },
  night: { sky: ['#0b1026', '#1b2a4a'], far: '#16213e', mid: '#1f3a4a', dirt: '#2f2f3a', grass: '#2e6f6f' },
  snow: { sky: ['#a8d0e6', '#f0f7ff'], far: '#c3d5e0', mid: '#9fb8c8', dirt: '#b0a08c', grass: '#e8f0f5' },
};
  dusk: { sky: ['#2b1055', '#ff758f'], far: '#4a2c6d', mid: '#6d3b52', dirt: '#5c4033', grass: '#2d4a22' },
  tundra: { sky: ['#89c2d9', '#f0f6ff'], far: '#9dbcd4', mid: '#8ba4bd', dirt: '#6e7f8d', grass: '#e9f1f7' },
};

export function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cam: Camera,
  v: VehicleState,
  lv: LevelConfig,
  tNow: number,
): void {
  const p = PAL[lv.theme] ?? PAL.meadow;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, p.sky[0]);
  g.addColorStop(1, p.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffe38e';
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.2, 42, 0, Math.PI * 2);
  ctx.fill();
  const hills = (par: number, col: string, base: number) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let sx = 0; sx <= w; sx += 24) {
      const wx = cam.x * par + (sx - w / 2) / cam.zoom;
      const y = heightAt(wx) - base * lv.baseAmplitude;
      ctx.lineTo(sx, (y - cam.y) * cam.zoom + h / 2);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  };
  hills(0.3, p.far, 6);
  hills(0.55, p.mid, 3);
