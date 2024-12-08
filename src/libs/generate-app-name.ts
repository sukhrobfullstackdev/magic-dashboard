import { App } from '@hooks/data/user/types';

export const generateDefaultAppName = (allApps: App[]) => {
  const nameCountMap = new Map();

  allApps.forEach((app) => {
    if (app.appName.startsWith('My App')) {
      const suffix = app.appName.replace('My App', '').trim();
      const number = parseInt(suffix, 10);
      if (!isNaN(number)) {
        nameCountMap.set(number, true);
      } else if (suffix === '') {
        nameCountMap.set(1, true);
      }
    }
  });

  let defaultNumber = 1;
  while (nameCountMap.has(defaultNumber)) {
    defaultNumber++;
  }

  return defaultNumber === 1 ? 'My App' : `My App ${defaultNumber}`;
};
