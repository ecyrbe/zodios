/**
 * omit properties from an object
 * @param obj - the object to omit properties from
 * @param keys - the keys to omit
 * @returns the object with the omitted properties
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const ret: T = { ...obj };
  for (const key of keys) {
    delete ret[key];
  }
  return ret;
}
