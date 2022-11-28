import { AnyZodiosRequestOptions } from "@zodios/core";

/**
 * omit properties from an object
 * @param obj - the object to omit properties from
 * @param keys - the keys to omit
 * @returns the object with the omitted properties
 */
export function omit<T, K extends keyof T>(
  obj: T | undefined,
  keys: K[]
): Omit<T, K> {
  const ret = { ...obj } as T;
  for (const key of keys) {
    delete ret[key];
  }
  return ret;
}

/**
 * pick properties from an object
 * @param obj - the object to pick properties from
 * @param keys - the keys to pick
 * @returns the object with the picked properties
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T | undefined,
  keys: K[]
): Pick<T, K> {
  const ret = {} as Pick<T, K>;
  if (obj) {
    for (const key of keys) {
      if (key in obj && obj[key] !== undefined) {
        ret[key] = obj[key];
      }
    }
  }
  return ret;
}

/**
 * set first letter of a string to uppercase
 * @param str - the string to capitalize
 * @returns - the string with the first letter uppercased
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function hasObjectBody(config?: any) {
  return (
    config?.body &&
    typeof config.body === "object" &&
    !Array.isArray(config.body)
  );
}

function isDefinedSignal(
  signal: AbortSignal | undefined | null
): signal is AbortSignal {
  return Boolean(signal);
}

/**
 * combine multiple abort signals into one
 * @param signals - the signals to listen to
 * @returns - the combined signal
 */
export function combineSignals(
  ...signals: (AbortSignal | undefined | null)[]
): AbortSignal | undefined {
  const definedSignals: AbortSignal[] = signals.filter(isDefinedSignal);
  if (definedSignals.length < 2) {
    return definedSignals[0];
  }
  const controller = new AbortController();

  function onAbort() {
    controller.abort();
    definedSignals.forEach((signal) => {
      signal.removeEventListener("abort", onAbort);
    });
  }

  definedSignals.forEach((signal) => {
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener("abort", onAbort);
    }
  });
  return controller.signal;
}
