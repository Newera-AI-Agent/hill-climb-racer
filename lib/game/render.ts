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

  const toX = (wx: number) => (wx - cam.x) * cam.zoom + w / 2;
  const toY = (wy: number) => (wy - cam.y) * cam.zoom + h / 2;
  ctx.fillStyle = p.dirt;
  ctx.beginPath();
  ctx.moveTo(0, h);
  const x0 = cam.x - w / 2 / cam.zoom - 50;
  const x1 = cam.x + w / 2 / cam.zoom + 50;
  for (let wx = x0; wx <= x1; wx += 16) {
    ctx.lineTo(toX(wx), toY(heightAt(wx)));
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p.grass;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let wx = x0; wx <= x1; wx += 16) {
    const sx = toX(wx), sy = toY(heightAt(wx));
    wx === x0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  const bob = Math.sin(tNow / 300) * 3;
  for (const c of lv.coins) {
    const sx = toX(c.x), sy = toY(c.y) + bob;
    if (sx < -40 || sx > w + 40) continue;
    const sq = Math.abs(Math.sin(tNow / 200 + c.x));
    ctx.fillStyle = '#ffd23f';
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy, Math.max(2, 8 * sq), 8, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  for (const f of lv.fuelCans) {
    const sx = toX(f.x);
    if (sx < -40 || sx > w + 40) continue;
    const sy = toY(f.y);
    ctx.fillStyle = '#d62828';
    ctx.fillRect(sx - 8, sy - 16, 16, 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', sx, sy - 8);
  }
  for (const wk of lv.wreckedCars) {
    const sx = toX(wk.x);
    if (sx < -60 || sx > w + 60) continue;
    const sy = toY(wk.y);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(-20, -18, 40, 18);
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-12, 0, 7, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 0, 7, 0, 7); ctx.fill();
    ctx.restore();
  }
  for (const cr of lv.creatures) {
    const sx = toX(cr.x);
    if (sx < -40 || sx > w + 40) continue;
    const sy = toY(cr.y);
    ctx.fillStyle = cr.alive ? '#3b2f2f' : '#5a4444';
    ctx.beginPath();
    ctx.ellipse(sx, sy - 8, 9, cr.alive ? 8 : 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (cr.alive) {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath(); ctx.arc(sx - 3, sy - 10, 2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 3, sy - 10, 2, 0, 7); ctx.fill();
    }
  }
  const flag = (x: number, y: number) => {
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 1, y - 34, 2, 34);
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(x, y - 34);
    ctx.lineTo(x + 14, y - 28);
    ctx.lineTo(x, y - 22);
    ctx.fill();
  };
  flag(toX(200), toY(heightAt(200)));
  flag(toX(lv.finishX), toY(heightAt(lv.finishX)));

  const shx = v.crashed ? Math.sin(tNow / 40) * v.crashTimer * 3 : 0;
  ctx.save();
  ctx.translate(toX(v.x) + shx, toY(v.y));
  ctx.rotate(v.angle);
  ctx.scale(cam.zoom, cam.zoom);
  const coll = CAR[lv.carColor] ?? CAR.red;
  const wheel = (ox: number, spin: number) => {
    ctx.save();
    ctx.translate(ox, 8);
    ctx.rotate(spin);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
    ctx.moveTo(0, -8); ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.restore();
  };
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -4); ctx.lineTo(-18, 8);
  ctx.moveTo(18, -4); ctx.lineTo(18, 8);
  ctx.stroke();
  wheel(-18, v.wheelSpin);
  wheel(18, v.wheelSpin);
  ctx.fillStyle = coll[0];
  ctx.strokeStyle = coll[1];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-26, -22, 52, 20, 6);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#bee3f8';
  ctx.fillRect(-8, -32, 18, 11);
  ctx.fillStyle = '#f4a261';
  ctx.beginPath(); ctx.arc(-11, -26, 6, 0, 7); ctx.fill();
  ctx.restore();
}
