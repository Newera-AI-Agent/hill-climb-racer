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
  KeyR: 'restart',
  KeyP: 'pause',
  Escape: 'pause',
  KeyM: 'mute',
  Enter: 'confirm',
};

const EDGE: InputAction[] = ['pause','restart','mute','confirm'];

export class InputManager {
  private held = new Set<InputAction>();
  private touch = new Set<InputAction>();
  private pressed = new Set<InputAction>();
  private bound = false;

  private onDown = (e: KeyboardEvent) => {
    const a = KEYMAP[e.code];
    if (!a) return;
    if (e.code.startsWith('Arrow') || e.code === 'Space')
      e.preventDefault();
    if (EDGE.includes(a) && !e.repeat) this.pressed.add(a);
    else this.held.add(a);
  };

  attach(): void {
    if (this.bound || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    this.bound = true;
  }

  detach(): void {
    if (!this.bound) return;
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    this.bound = false;
  }

  poll(): InputState {
    const has = (a: InputAction) =>
      this.held.has(a) || this.touch.has(a) || this.pressed.has(a);
    return {
      gas: has('gas'), brake: has('brake'),
      tiltLeft: has('tiltLeft'), tiltRight: has('tiltRight'),
      restart: has('restart'), pause: has('pause'),
      mute: has('mute'), confirm: has('confirm'),
    };
  }

  consume(a: InputAction): boolean {
    if (this.pressed.has(a)) { this.pressed.delete(a); return true; }
    return false;
  }

  setTouch(a: InputAction, down: boolean): void {
    if (EDGE.includes(a)) {
      if (down) this.pressed.add(a);
    } else if (down) this.touch.add(a);
    else this.touch.delete(a);
  }
}
