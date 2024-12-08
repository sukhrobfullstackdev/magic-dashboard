// https://github.com/marpple/FxTS/blob/main/src/types/Include.ts
export type Include<T, N> = T extends N ? T : never;

// https://github.com/marpple/FxTS/blob/main/src/isUndefined.ts
export const isUndefined = <T>(a: T): a is Include<T, undefined> => a === undefined;

// https://github.com/marpple/FxTS/blob/main/src/isNull.ts
export const isNull = <T>(input: T): input is Include<T, null> => input === null;

// https://github.com/marpple/FxTS/blob/main/src/isNil.ts
export const isNil = <T>(a: T): a is Include<T, null | undefined> => isUndefined(a) || isNull(a);

// https://github.com/marpple/FxTS/blob/main/src/isArray.ts
export const isArray = <T>(a: T): a is Include<T, unknown[] | Readonly<unknown[]>> => Array.isArray(a);

// https://github.com/marpple/FxTS/blob/main/src/isEmpty.ts
export const isEmpty = <T>(value: T): boolean => {
  if (isNil(value)) return true; // if value is null or undefined.

  if (
    typeof value === 'object' &&
    (value as object).constructor === Object &&
    Object.getOwnPropertyNames(value).length === 0
  )
    return true; // if value is a literal object and have no property or method.

  if (isArray(value) && value.length === 0) return true; // if value have no item.

  if (value === '') return true;

  if (value instanceof Map || value instanceof Set) return value.size === 0; // if value is a Map or Set and have no item.

  return false;
};
