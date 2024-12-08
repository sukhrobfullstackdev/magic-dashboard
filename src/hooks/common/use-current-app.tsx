'use client';

import { useAllApps } from '@hooks/common/use-all-apps';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useCurrentApp = () => {
  const searchParams = useSearchParams();
  const appId = searchParams?.get('cid') as string;
  const { allApps } = useAllApps();

  const currentApp = useMemo(() => {
    return allApps.find((v) => v.appId === appId) ?? undefined;
  }, [appId, allApps]);

  return { currentApp };
};
