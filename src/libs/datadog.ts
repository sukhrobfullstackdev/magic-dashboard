import { DATADOG_CLIENT_KEY, DATADOG_RUM_APP_KEY, DATADOG_RUM_CLIENT_KEY, ENV, IS_CLIENT, IS_ENV_PROD } from '@config';
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: DATADOG_CLIENT_KEY,
  site: 'datadoghq.com',
  service: 'dashboard',
  forwardErrorsToLogs: true,
  useCrossSiteSessionCookie: true,
  env: ENV,
  beforeSend() {
    return ENV !== 'local';
  },
});

datadogLogs.setGlobalContext({
  clientId: IS_CLIENT ? new URLSearchParams(window.location.search).get('cid') : null,
});

export const logger = datadogLogs.createLogger('global');

export const initDatadogRum = async () => {
  const { datadogRum } = await import('@datadog/browser-rum');

  datadogRum.init({
    applicationId: DATADOG_RUM_APP_KEY,
    clientToken: DATADOG_RUM_CLIENT_KEY,
    env: ENV,
    site: 'datadoghq.com',
    service: 'dashboard',
    sessionSampleRate: IS_ENV_PROD ? 10 : 100,
    sessionReplaySampleRate: IS_ENV_PROD ? 10 : 100,
    trackUserInteractions: true,
    useCrossSiteSessionCookie: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    silentMultipleInit: true,
    allowedTracingUrls: [
      'https://api.magic.link',
      'https://auth.magic.link',
      'https://api-a.prod.magic-corp.link',
      'https://api.fortmatic.com',
      'https://dashboard.magic.link',
      'https://auth.dev.magic.link',
      'https://auth.stagef.magic.link',
      'https://dashboard.dev.magic.link',
      'https://dashboard.stagef.magic.link',
      'https://api.dev.magic.link',
      'https://api.stagef.magic.link',
      'https://events.magic.link',
      'https://events-int.magic.link',
    ],
  });

  datadogRum.startSessionReplayRecording();
};
