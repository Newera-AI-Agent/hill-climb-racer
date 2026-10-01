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
