export interface Vec2 { x: number; y: number }
export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover'
export interface InputState { gas: boolean; brake: boolean }
export interface Pickup { id: number; type: 'coin' | 'fuel'; x: number; y: number; taken: boolean }
export interface RunStats {
  distance: number; coins: number; fuel: number; speed: number; flips: number;
  cause?: 'fuel' | 'crash'
}
