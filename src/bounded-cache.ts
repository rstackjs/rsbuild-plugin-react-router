export const setBoundedCacheEntry = <Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value,
  maxEntries: number
): void => {
  if (maxEntries <= 0) {
    cache.clear();
    return;
  }
  if (!cache.has(key) && cache.size >= maxEntries) {
    const oldestEntry = cache.keys().next();
    if (!oldestEntry.done) {
      cache.delete(oldestEntry.value);
    }
  }
  cache.set(key, value);
};
