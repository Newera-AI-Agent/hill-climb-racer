import type { InputState } from './types'
export type InputAction = 'gas' | 'brake' | 'pause' | 'restart' | 'mute' | 'confirm'
const KEYMAP: Record<string, InputAction> = {
  ArrowRight: 'gas', KeyD: 'gas', ArrowUp: 'gas', KeyW: 'gas',
  ArrowLeft: 'brake', KeyA: 'brake', ArrowDown: 'brake', KeyS: 'brake',
  KeyP: 'pause', Escape: 'pause', KeyR: 'restart', KeyM: 'mute', Enter: 'confirm', Space: 'confirm',
}
const EDGE: InputAction[] = ['pause', 'restart', 'mute', 'confirm']
export class InputManager {
  private held = new Set<InputAction>()
  private touch = new Set<InputAction>()
  private pressed = new Set<InputAction>()
  private bound = false
  private onDown = (e: KeyboardEvent) => {
    const a = KEYMAP[e.code]
    if (!a) return
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault()
    if (EDGE.includes(a)) { if (!e.repeat) this.pressed.add(a) } else this.held.add(a)
  }
  private onUp = (e: KeyboardEvent) => {
    const a = KEYMAP[e.code]
    if (a) this.held.delete(a)
  }
  attach(): void {
    if (this.bound || typeof window === 'undefined') return
    window.addEventListener('keydown', this.onDown)
    window.addEventListener('keyup', this.onUp)
    this.bound = true
  }
  detach(): void {
    if (!this.bound) return
    window.removeEventListener('keydown', this.onDown)
    window.removeEventListener('keyup', this.onUp)
    this.bound = false
  }
  poll(): InputState {
    const has = (a: InputAction) => this.held.has(a) || this.touch.has(a)
    return { gas: has('gas'), brake: has('brake') }
  }
  consume(a: InputAction): boolean {
    if (this.pressed.has(a)) { this.pressed.delete(a); return true }
    return false
  }
  clearPressed(): void { this.pressed.clear() }
  setTouch(a: InputAction, down: boolean): void {
    if (EDGE.includes(a)) { if (down) this.pressed.add(a) }
    else if (down) this.touch.add(a); else this.touch.delete(a)
  }
}
