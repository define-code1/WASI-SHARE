/**
 * WASI SHARE — Transfer State Machine
 * Enforces valid state transitions and prevents illegal or contradictory UI states.
 */

import { TransferState } from './types';

export class TransferStateMachine {
  private currentState: TransferState;
  private readonly listeners: Set<(state: TransferState, prev: TransferState) => void> = new Set();

  // Permitted transition map
  private static readonly VALID_TRANSITIONS: Record<TransferState, TransferState[]> = {
    idle: ['pairing', 'connected', 'preparing'],
    pairing: ['connected', 'failed', 'cancelled', 'idle'],
    connected: ['awaiting_approval', 'preparing', 'idle', 'interrupted'],
    awaiting_approval: ['preparing', 'cancelled', 'failed', 'connected'],
    preparing: ['transferring', 'cancelled', 'failed', 'interrupted'],
    transferring: ['verifying', 'cancelled', 'interrupted', 'failed'],
    verifying: ['completed', 'failed', 'cancelled'],
    completed: ['idle', 'preparing', 'connected'],
    failed: ['idle', 'preparing', 'connected'],
    cancelled: ['idle', 'preparing', 'connected'],
    interrupted: ['connected', 'idle', 'preparing', 'failed'],
  };

  constructor(initialState: TransferState = 'idle') {
    this.currentState = initialState;
  }

  public getState(): TransferState {
    return this.currentState;
  }

  public canTransitionTo(nextState: TransferState): boolean {
    const allowed = TransferStateMachine.VALID_TRANSITIONS[this.currentState];
    return allowed ? allowed.includes(nextState) : false;
  }

  public transition(nextState: TransferState): boolean {
    if (this.currentState === nextState) {
      return true; // No-op
    }

    if (!this.canTransitionTo(nextState)) {
      console.warn(
        `[WASI SHARE] Invalid state transition rejected: '${this.currentState}' -> '${nextState}'`
      );
      return false;
    }

    const prev = this.currentState;
    this.currentState = nextState;
    this.notify(nextState, prev);
    return true;
  }

  public reset(): void {
    const prev = this.currentState;
    this.currentState = 'idle';
    this.notify('idle', prev);
  }

  public subscribe(fn: (state: TransferState, prev: TransferState) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify(current: TransferState, prev: TransferState): void {
    for (const listener of this.listeners) {
      try {
        listener(current, prev);
      } catch (err) {
        console.error('[WASI SHARE] State listener error:', err);
      }
    }
  }
}
