/**
 * Returns object where Object.entries will equal entries,
 * i.e. a object with the structure {
 *   [key]: value, (for each [key, value] = entry in entries)
 * }
 *
 * If throwOnDuplicateKey is true it will throw if two entries have the same key.
 */
export function fromEntries<V>(
  entries: [string, V][], throwOnDuplicateKeys = false,
): Record<string, V> {
  const usedKeyMap: Record<string, true> = {};
  const result: Record<string, V> = {};

  entries.forEach(([key, value]) => {
    if (throwOnDuplicateKeys) {
      if (usedKeyMap[key]) {
        throw new Error(`Key "${key}" is used multiple times in fromEntries`);
      } else {
        usedKeyMap[key] = true;
      }
    }

    result[key] = value;
  });

  return result;
}

/**
 * Returns object where the original entry [key, value] is
 * replaced by [key, mapping(value, key)].
 */
export function mapObject<V, MV>(
  original: Record<string, V>,
  mapping: (value: V, key: string) => MV,
): Record<string, MV> {
  const mapped: Record<string, MV> = {};

  Object.entries(original).forEach(([key, value]) => {
    mapped[key] = mapping(value, key);
  });

  return mapped;
}

/**
 * Returns object where the original entry [key, value]
 * is only included if filter(value, key) === true.
 */
export function filterObject<V>(
  original: Record<string, V>,
  filter: (value: V, key: string) => boolean,
): Record<string, V> {
  const filtered: Record<string, V> = { };

  Object.entries(original).forEach(([key, value]) => {
    if (filter(value, key)) {
      filtered[key] = value;
    }
  });

  return filtered;
}
