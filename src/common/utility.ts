import { isObject } from "./type-guards";

/**
 * Removes items that are contained multiple times in arr by using equal to compare the items.
 */
export function filterDuplicates<T>(
  arr: T[],
  equal: (a: T, b: T) => boolean = (a: T, b: T): boolean => a === b,
): T[] {
  const result: T[] = [];

  arr.forEach((item) => {
    if (result.every((item2) => !equal(item, item2))) {
      result.push(item);
    }
  });

  return result;
}

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

export function clone<T>(value: T): T {
  if (Array.isArray(value)) {
    // @ts-ignore
    return value.map((item) => clone(item));
  } else if (isObject(value)) {
    // @ts-ignore
    return mapObject(value, (item) => clone(item));
  } else {
    return value;
  }
}

/**
 * Returns merged base and specific values.
 * If ignoreUndefined is set when specific is undefined base value is used.
 * (i.e. an undefined value does not overwrite a base value)
 */
export function merge<B, S>(
  base: B,
  specific: S,
  ignoreUndefined = false,
): B & S {
  if (Array.isArray(specific)) {
    if (Array.isArray(base)) {
      // @ts-ignore
      return clone(base).concat(clone(specific));
    } else {
      // @ts-ignore
      return clone(specific);
    }
  } else if (isObject(specific)) {
    if (isObject(base)) {
      const result: Record<string, any> = {};

      const baseKeys = Object.keys(base);
      const specKeys = Object.keys(specific);

      baseKeys.concat(specKeys).forEach((key) => {
        if (baseKeys.includes(key) && specKeys.includes(key)) {
          result[key] = merge(base[key], specific[key], ignoreUndefined);
        } else if (baseKeys.includes(key)) {
          result[key] = clone(base[key]);
        } else {
          result[key] = clone(specific[key]);
        }
      });

      // @ts-ignore
      return result;
    } else {
      // @ts-ignore
      return clone(specific);
    }
  } else if (ignoreUndefined && specific === undefined) {
    // @ts-ignore
    return base;
  } else {
    // @ts-ignore
    return specific;
  }
}
