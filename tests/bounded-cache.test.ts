import { describe, expect, it } from '@rstest/core';
import { setBoundedCacheEntry } from '../src/bounded-cache';

describe('bounded cache helpers', () => {
  it('evicts the oldest entry only when inserting past the maximum size', () => {
    const cache = new Map<string, number>([
      ['first', 1],
      ['second', 2],
    ]);

    setBoundedCacheEntry(cache, 'second', 22, 2);
    expect([...cache.entries()]).toEqual([
      ['first', 1],
      ['second', 22],
    ]);

    setBoundedCacheEntry(cache, 'third', 3, 2);
    expect([...cache.entries()]).toEqual([
      ['second', 22],
      ['third', 3],
    ]);
  });

  it('clears entries when the maximum size is not positive', () => {
    const cache = new Map<string, number>([['first', 1]]);

    setBoundedCacheEntry(cache, 'second', 2, 0);

    expect([...cache.entries()]).toEqual([]);
  });

  it('evicts an undefined oldest key when inserting past the maximum size', () => {
    const cache = new Map<string | undefined, number>([
      [undefined, 1],
      ['second', 2],
    ]);

    setBoundedCacheEntry(cache, 'third', 3, 2);

    expect([...cache.entries()]).toEqual([
      ['second', 2],
      ['third', 3],
    ]);
  });
});
