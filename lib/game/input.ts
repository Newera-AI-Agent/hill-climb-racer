import type { InputState, InputAction } from './types';

const KEYMAP: Record<string, InputAction> = {
  ArrowUp: 'gas',
  ArrowDown: 'brake',
  ArrowLeft: 'tiltLeft',
  ArrowRight: 'tiltRight',
  KeyW: 'gas',
  KeyS: 'brake',
  KeyA: 'tiltLeft',
  KeyD: 'tiltRight',
  Space: 'gas',
