export function deepEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;

  return true;
}


// TODO if where is a function,
// this caching fails.
// Probably a key need to be passed from the outside
export function memo<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const result = func(...args);
    const cachedResult = cache.get(key);
    if (cache.has(key) && deepEqual(cachedResult, result)) return cachedResult as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}
