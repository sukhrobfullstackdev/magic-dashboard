import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { hightouch } from '@libs/analytics';
import { logger } from '@libs/datadog';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { useEffect } from 'react';

export const GAWithDeveloperEmail = () => {
  const { data: userInfo } = useUserInfoQuery(userQueryKeys.info());

  useEffect(() => {
    if (userInfo) {
      try {
        const dataLayer = window?.dataLayer || [];
        dataLayer.push({ developerEmail: userInfo.email });

        hightouch.alias(`magic-developer:${userInfo.id}`);
        /* Need to identify again: https://segment.com/docs/destinations/amplitude/#alias */
        hightouch.identify(`magic-developer:${userInfo.id}`, { user_type: 'magic-developer', email: userInfo.email });
      } catch (error) {
        logger.error('Failed to identify user in Google Analytics', {}, error as Error);
      }
    }
  }, [userInfo]);

  return (
    <>
      <GoogleAnalytics gaId="G-G4TN253S40" />
      <GoogleTagManager gtmId="GTM-M5KT69S" />
    </>
  );
};
