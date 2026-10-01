import { heightAt, slopeAt } from './terrain';
import type { CarColor, InputState, Vec2 } from './types';

export interface VehicleTuning {
  mass: number;
  inertia: number;
  engineForce: number;
  brakeForce: number;
  airTorque: number;
  suspensionK: number;
  suspensionDamp: number;
  suspensionTravel: number;
  wheelRadius: number;
  wheelBase: number;
  chassisHalfW: number;
  chassisHalfH: number;
  gravity: number;
  grip: number;
}

export const DEFAULT_TUNING: VehicleTuning = {
  mass: 120,
  inertia: 4000,
  engineForce: 4200,
  brakeForce: 5200,
  airTorque: 6500,
  suspensionK: 420,
  suspensionDamp: 46,
  suspensionTravel: 14,
  wheelRadius: 11,
  wheelBase: 46,
  chassisHalfW: 24,
  chassisHalfH: 9,
  gravity: 520,
  grip: 0.92,
};

export interface Wheel {
  offset: Vec2; // chassis-local mount point, y positive down
  spin: number; // wheel visual rotation (radians)
  compression: number; // 0..1 for rendering
  grounded: boolean;
}

export interface VehicleState {
  x: number;
  y: number; // terrain-space: y is negative (up) like canvas, ground at heightAt(x)
  vx: number;
  vy: number;
  angle: number; // radians, 0 = level, positive = nose up
  av: number; // angular velocity
  wheels: [Wheel, Wheel];
  grounded: boolean;
  airborneTime: number;
  pendingFlips: number;
  lastFlipBucket: number;
  crashed: boolean;
  crashTimer: number;
  engineOn: number; // 0..1 for sound/render
  color: CarColor;
  tuning: VehicleTuning;
}

export function createVehicle(x: number, color: CarColor = 'red'): VehicleState {
  const t = DEFAULT_TUNING;
  const gy = heightAt(x);
  return {
    x,
    y: gy - t.wheelRadius - t.suspensionTravel - t.chassisHalfH - 2,
    vx: 0,
    vy: 0,
    angle: 0,
    av: 0,
    wheels: [
      { offset: { x: -t.wheelBase / 2, y: 8 }, spin: 0, compression: 0, grounded: false },
      { offset: { x: t.wheelBase / 2, y: 8 }, spin: 0, compression: 0, grounded: false },
    ],
    grounded: true,
    airborneTime: 0,
    pendingFlips: 0,
    lastFlipBucket: 0,
    crashed: false,
    crashTimer: 0,
    engineOn: 0,
    color,
    tuning: t,
  };
}

function rot(v: Vec2, a: number): Vec2 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

export interface StepEvents {
  flipsCompleted: number;
  airtimeLanded: number;
  crashed: boolean;
}

function wrapPi(a: number): number {

function wrapPi(a: number) {
  const t = Math.PI * 2;
  return ((a % t) + t + Math.PI) % t - Math.PI;
}

export function stepVehicle(
  v: VehicleState,
  input: InputState,
  dt: number
): StepEvents {
  const t = v.tuning;
  const ev: StepEvents = {
    flipsCompleted: 0,
    airtimeLanded: 0,
    crashed: false,
  };
  if (v.crashed) {
    v.crashTimer += dt;
