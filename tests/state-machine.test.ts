import { describe, it, expect } from 'vitest';
import { TransferStateMachine } from '../packages/shared/state-machine';

describe('Transfer State Machine', () => {
  it('initializes in idle state', () => {
    const sm = new TransferStateMachine();
    expect(sm.getState()).toBe('idle');
  });

  it('allows valid transitions in standard transfer workflow', () => {
    const sm = new TransferStateMachine('idle');

    expect(sm.transition('pairing')).toBe(true);
    expect(sm.getState()).toBe('pairing');

    expect(sm.transition('connected')).toBe(true);
    expect(sm.getState()).toBe('connected');

    expect(sm.transition('awaiting_approval')).toBe(true);
    expect(sm.getState()).toBe('awaiting_approval');

    expect(sm.transition('preparing')).toBe(true);
    expect(sm.getState()).toBe('preparing');

    expect(sm.transition('transferring')).toBe(true);
    expect(sm.getState()).toBe('transferring');

    expect(sm.transition('verifying')).toBe(true);
    expect(sm.getState()).toBe('verifying');

    expect(sm.transition('completed')).toBe(true);
    expect(sm.getState()).toBe('completed');
  });

  it('rejects invalid or contradictory transitions', () => {
    const sm = new TransferStateMachine('idle');

    // Cannot jump from idle straight to verifying
    expect(sm.transition('verifying')).toBe(false);
    expect(sm.getState()).toBe('idle');

    // Cannot jump from awaiting_approval to completed
    sm.transition('connected');
    sm.transition('awaiting_approval');
    expect(sm.transition('completed')).toBe(false);
    expect(sm.getState()).toBe('awaiting_approval');
  });

  it('handles cancellation and resets cleanly', () => {
    const sm = new TransferStateMachine('transferring');
    expect(sm.transition('cancelled')).toBe(true);
    expect(sm.getState()).toBe('cancelled');

    sm.reset();
    expect(sm.getState()).toBe('idle');
  });
});
