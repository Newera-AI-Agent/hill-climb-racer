import {
  makeHeightFn,
  pickupsInRange,
  type HeightFn,
  type Pickup,
} from './terrain';
import {
  createVehicle,
  stepVehicle,
  type VehicleState,
} from './vehicle';
import type { GamePhase, InputState } from './types';

export interface RunStats {
  distance: number;
  coins: number;
  fuel: number;
  speed: number;
  flips: number;
  cause?: 'fuel' | 'crash';
}

const FUEL_MAX = 100;
const FUEL_DRAIN = 1.7;         // units per second while driving
const FUEL_IDLE_DRAIN = 0.35;   // passive drain
const COIN_VALUE = 5;
const FLIP_BONUS = 50;
const DIST_BONUS_STEP = 100;    // meters per +1 coin tick
const START_X = 0;
const BEST_KEY = 'hill-climb-racer:best';
const PICKUP_RADIUS = 34;

export class GameEngine {
  readonly height: HeightFn;
  vehicle: VehicleState;
  pickups: Pickup[] = [];
  phase: GamePhase = 'menu';
  stats: RunStats = { distance: 0, coins: 0, fuel: FUEL_MAX, speed: 0, flips: 0 };
  best = 0;
  muted = false;
  time = 0;

  private materialized = new Set<number>();
  private collected = new Set<number>();
  private lastPickupMin = -1e9;
  private lastPickupMax = -1e9;
  private distanceCoinCarry = 0;

  constructor() {
    this.height = makeHeightFn();
    this.vehicle = createVehicle(START_X);
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(BEST_KEY);
      this.best = raw ? Number(raw) || 0 : 0;
    }
  }

  reset(): void {
    this.vehicle = createVehicle(START_X);
    this.pickups = [];
    this.materialized.clear();
    this.collected.clear();
    this.lastPickupMin = -1e9;
    this.lastPickupMax = -1e9;
    this.stats = { distance: 0, coins: 0, fuel: FUEL_MAX, speed: 0, flips: 0 };
    this.distanceCoinCarry = 0;
    this.time = 0;
  }

  start(): void {
    this.reset();
    this.phase = 'playing';
  }

  togglePause(): void {
    if (this.phase === 'playing') this.phase = 'paused';
    else if (this.phase === 'paused') this.phase = 'playing';
  }

  toMenu(): void {
    this.phase = 'menu';
    this.reset();
  }

  private syncPickups(): void {
    const minX = this.vehicle.x - 300;
    const maxX = this.vehicle.x + 1600;
    if (minX > this.lastPickupMin && maxX < this.lastPickupMax && this.pickups.length > 0) {
      return; // window already materialized
    }
    this.lastPickupMin = minX;
    this.lastPickupMax = maxX;
    const fresh = pickupsInRange(this.height, minX, maxX);
    this.pickups = fresh.filter((p) => !this.collected.has(p.id));
    for (const p of this.pickups) this.materialized.add(p.id);
  }

  private gameOver(cause: 'fuel' | 'crash'): void {
    this.phase = 'gameover';
    this.stats.cause = cause;
    const d = Math.max(0, Math.floor(this.stats.distance));
    if (d > this.best) {
      this.best = d;
      if (typeof window !== 'undefined')
        window.localStorage.setItem(BEST_KEY, String(d));
    }
  }

  step(input: InputState, dt: number): StepOutcome {
    const outcome: StepOutcome = { coin: false, fuel: false, crash: false, flip: false, air: false };
    if (this.phase !== 'playing') return outcome;
    this.time += dt;

    const ev = stepVehicle(this.vehicle, input, dt);
    if (ev.crashed && !outcome.crash) outcome.crash = true;

    this.stats.speed = Math.max(0, this.vehicle.vx);
    const prevDistance = this.stats.distance;
    this.stats.distance = Math.max(0, (this.vehicle.x - START_X) / 28);
    this.distanceCoinCarry += this.stats.distance - prevDistance;
    while (this.distanceCoinCarry >= DIST_BONUS_STEP) {
      this.distanceCoinCarry -= DIST_BONUS_STEP;
      this.stats.coins += 1;
    }

    if (ev.flipsCompleted > 0) {
      this.stats.flips += ev.flipsCompleted;
      this.stats.coins += FLIP_BONUS * ev.flipsCompleted;
      outcome.flip = true;
    }
    if (ev.airtimeLanded > 0) outcome.air = true;

    this.syncPickups();
    const v = this.vehicle;
    for (const p of this.pickups) {
      if (p.taken) continue;
      const dx = p.x - v.x;
      const dy = p.y - (v.y + 6);
      if (dx * dx + dy * dy < PICKUP_RADIUS * PICKUP_RADIUS) {
        p.taken = true;
        this.collected.add(p.id);
        if (p.type === 'coin') {
          this.stats.coins += COIN_VALUE;
          outcome.coin = true;
        } else {
          this.stats.fuel = Math.min(FUEL_MAX, this.stats.fuel + 35);
          outcome.fuel = true;
        }
      }
    }

    const drain = FUEL_IDLE_DRAIN + (input.gas || input.brake ? FUEL_DRAIN : 0);
    this.stats.fuel -= drain * dt;

    if (this.stats.fuel <= 0) {
      this.stats.fuel = 0;
      this.gameOver('fuel');
    } else if (v.crashed) {
      this.gameOver('crash');
    }
    return outcome;
  }
}

export interface StepOutcome {
  coin: boolean;
  fuel: boolean;
  crash: boolean;
  flip: boolean;
  air: boolean;
}
