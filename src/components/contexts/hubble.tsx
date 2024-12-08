import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export const Hubble = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: userInfo } = useUserInfoQuery(userQueryKeys.info());

  useEffect(() => {
    if (isLoaded && userInfo) {
      try {
        window.Hubble.identify(userInfo.id, {
          email: userInfo.email,
          teamid: userInfo.teamId,
        });
      } catch (error) {
        /* silently catch hubble action */
        logger.error('Failed to identify user in Hubble', {}, error as Error);
      }
    }
  }, [isLoaded, userInfo]);

  return (
    <Script
      async
      src="https://sdk.hubble.team/sdk/acd522ab-5ee7-4236-b03e-eb77f2071d62.js"
      onReady={() => {
        setIsLoaded(true);
      }}
    />
  );
};
