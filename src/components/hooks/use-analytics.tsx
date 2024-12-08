import { ENV, IS_CLIENT } from '@config/env';
import { useDashboardStore } from '@hooks/data/store/store';
import { hightouch } from '@libs/analytics';
import { sendGAEvent } from '@next/third-parties/google';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export const useAnalytics = () => {
  const { teamId } = useDashboardStore();
  const searchParams = useSearchParams();
  const appId = searchParams?.get('cid');

  const baseProperties = useMemo(
    () => ({
      selectedTeamId: teamId ?? '',
      selectedClientId: appId ?? '',
      source: 'magic-dashboard',
      env: ENV,
    }),
    [appId, teamId],
  );

  const trackAction = useCallback(
    (action: string, extraProperties = {}) => {
      if (!IS_CLIENT) {
        return;
      }

      const properties = {
        ...baseProperties,
        ...extraProperties,
      };

      // hightouch event
      hightouch.track(action, properties);

      // GA Event
      sendGAEvent('event', `Dashboard - ${action}`, {
        ...properties,
      });
    },
    [baseProperties],
  );

  return { trackAction };
};
