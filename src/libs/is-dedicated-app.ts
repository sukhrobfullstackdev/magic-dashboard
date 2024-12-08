import { AppType, AUTH_APP, EMBEDDED_APP } from '@constants/appInfo';

export const isDedicatedApp = (appType: AppType) => {
  return appType === AUTH_APP || appType === EMBEDDED_APP;
};
