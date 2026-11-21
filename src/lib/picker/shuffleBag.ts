export interface ShuffleBagState {
  poolKey: string;
  bag: string[];
  position: number;
  lastId: string | null;
}

export const emptyBag: ShuffleBagState = { poolKey: '', bag: [], position: 0, lastId: null };

export function shuffled(ids: string[], random: () => number): string[] {
  const result = [...ids];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function dealNext(
  poolIds: string[],
  state: ShuffleBagState,
  random: () => number,
): { id: string; state: ShuffleBagState } {
  if (poolIds.length === 0) throw new Error('The reviewed reminder pool is empty.');
  const poolKey = poolIds.join('|');
  // A Set keeps this linear even for the 6,236-verse Qur'an pool.
  const inPool = new Set(poolIds);
  let bag = state.poolKey === poolKey ? state.bag.filter((id) => inPool.has(id)) : [];
  let position = state.poolKey === poolKey ? Math.min(state.position, bag.length) : bag.length;

  if (position >= bag.length) {
    bag = shuffled(poolIds, random);
    if (bag.length > 1 && bag[0] === state.lastId) {
      [bag[0], bag[1]] = [bag[1], bag[0]];
    }
    position = 0;
  }

  const id = bag[position];
  return {
    id,
    state: { poolKey, bag, position: position + 1, lastId: id },
  };
}

export function cryptoRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 4_294_967_296;
}
