'use client';

import { PassportCallout } from '@components/partials/passport-callout/passport-callout';
import { ApiKeysCard } from '@components/views/home-view/api-keys-card';
import { LoginsCard } from '@components/views/home-view/logins-card';
import NewAppCard from '@components/views/home-view/new-app-card';
import { NoticeBanner } from '@components/views/home-view/notice-banner';
import { PaymentOverdueBanner } from '@components/views/home-view/payment-overdue-banner';
import { QuickStartCard } from '@components/views/home-view/quick-start-card';
import { ResourcesCard } from '@components/views/home-view/resources-card';
import { PASSPORT_APP } from '@constants/appInfo';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import { css } from '@styled/css';
import { Flex, Stack } from '@styled/jsx';

const Resolved = ({ app }: { app: App }) => {
  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );

  return (
    <>
      <PaymentOverdueBanner />
      <NoticeBanner />
      <Stack
        p={6}
        gap={6}
        maxW="1296px"
        className={css({ '@media screen and (max-width: 1420px)': { maxW: '47.5rem' } })}
      >
        {app.appType !== PASSPORT_APP && <PassportCallout />}

        <Flex gap={6} className={css({ '@media screen and (max-width: 1420px)': { flexDir: 'column' } })}>
          <Stack gap={6} flexGrow={1} maxW="47.5rem">
            <QuickStartCard appInfo={appInfo} />
            <ApiKeysCard appInfo={appInfo} />
            <ResourcesCard appType={appInfo.appType} />
            <NewAppCard appInfo={appInfo} />
          </Stack>

          <LoginsCard appInfo={appInfo} />
        </Flex>
      </Stack>
    </>
  );
};

export const HomeView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp ? <Resolved app={currentApp} /> : null;
};
