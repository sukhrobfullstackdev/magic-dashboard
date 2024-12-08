import type { CamelCaseObjectDeep } from '@custom-types/common/util';

export const camelizeSnakeKeys = <T>(objToConvert: T): CamelCaseObjectDeep<T> => {
  const converted: Record<string, unknown> = {};

  if (typeof objToConvert !== 'object' || !objToConvert) {
    return objToConvert as CamelCaseObjectDeep<T>;
  }

  Object.keys(objToConvert).forEach((k: string) => {
    const key: keyof T = k as keyof T;
    const newKey = k.replace(/(_\w)/g, (w) => w[1].toUpperCase());

    converted[newKey] = objToConvert[key];

    if (Array.isArray(objToConvert[key])) {
      converted[newKey] = (objToConvert[key] as unknown[]).map(camelizeSnakeKeys);
    } else if (typeof objToConvert[key] !== 'object') {
      converted[newKey] = objToConvert[key];
    } else {
      converted[newKey] = camelizeSnakeKeys(objToConvert[key]);
    }
  });

  return converted as CamelCaseObjectDeep<T>;
};
