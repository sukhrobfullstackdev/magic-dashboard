import { DATADOG_RUM_APP_KEY, DATADOG_RUM_CLIENT_KEY } from '@config';
import { initDatadogRum } from '@libs/datadog';
import { useEffect, useRef } from 'react';

export const DatadogRUM = () => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    (async () => {
      if (!DATADOG_RUM_APP_KEY || !DATADOG_RUM_CLIENT_KEY || hasInitialized.current) {
        return;
      }

      await initDatadogRum();

      hasInitialized.current = true;
    })();
  }, []);

  return <></>;
};
