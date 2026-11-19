import { describe, expect, it } from 'vitest';
import { dealNext, emptyBag } from '../../src/lib/picker/shuffleBag';

const sequence = (...values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('shuffle bag', () => {
  it('deals every item before repeating', () => {
    const pool = ['a', 'b', 'c', 'd'];
    let state = emptyBag;
    const dealt: string[] = [];
    for (let index = 0; index < pool.length; index += 1) {
      const result = dealNext(pool, state, sequence(0.2, 0.7, 0.4));
      dealt.push(result.id);
      state = result.state;
    }
    expect(new Set(dealt).size).toBe(pool.length);
  });

  it('does not repeat the previous bag’s last item at the boundary', () => {
    const pool = ['a', 'b'];
    let state = emptyBag;
    let last = '';
    for (let index = 0; index < 20; index += 1) {
      const result = dealNext(pool, state, () => 0);
      expect(result.id).not.toBe(last);
      last = result.id;
      state = result.state;
    }
  });

  it('supports a pool of one', () => {
    const result = dealNext(['only'], emptyBag, () => 0.5);
    expect(result.id).toBe('only');
  });

  it('resets safely when the pool changes', () => {
    const first = dealNext(['a', 'b'], emptyBag, () => 0);
    const changed = dealNext(['a', 'b', 'c'], first.state, () => 0);
    expect(changed.state.poolKey).toBe('a|b|c');
    expect(changed.state.bag).toHaveLength(3);
  });
});
