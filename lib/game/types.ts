// Shared types for the Hill Climb Racer engine.

export interface Vec2 {
  x: number;
  y: number;
}

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

export type CarColor = 'red' | 'blue' | 'green' | 'orange';

export interface InputState {
  gas: boolean;
  brake: boolean;
}

export interface Wheel {
  /** attachment offset from chassis center, in chassis-local space */
  ax: number;
  ay: number;
  /** world position of the wheel contact point (bottom of suspension) */
  x: number;
  y: number;
  /** current suspension compression (0..1) */
  compression: number;
  /** wheel spin angle (radians) */
  rotation: number;
  /** true if the wheel is touching the ground */
  grounded: boolean;
}

export interface CarState {
  /** chassis center, world space */
  pos: Vec2;
  vel: Vec2;
  angle: number;
  angularVel: number;
  wheels: Wheel[];
  /** normalized facing (1 = right). The game only drives right. */
  dead: boolean;
  airTime: number;
  flipAccumulator: number; // accumulated rotation in air (radians)
}

export type PickupKind = 'coin' | 'fuel';

export interface Pickup {
  kind: PickupKind;
  x: number;
  y: number;
  taken: boolean;
  /** animation phase */
  t: number;
}

export interface RunStats {
  distance: number; // meters
  coins: number;
  fuel: number; // 0..100
  speed: number; // m/s
  flips: number;
  cause?: 'fuel' | 'crash';
}

export interface GameSnapshot {
  phase: GamePhase;
  car: { x: number; y: number; angle: number; dead: boolean };
  stats: RunStats;
  best: number;
}
