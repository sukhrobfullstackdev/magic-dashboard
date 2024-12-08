import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { EmbeddedWalletQuickstart } from '@components/partials/quickstart-embedded-wallet/quickstart';
import { PassportQuickstart } from '@components/partials/quickstart-passport/passport-quickstart';
import { PASSPORT_APP } from '@constants/appInfo';
import { useSignupAppUsersSuspenseQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { type AppInfo } from '@hooks/data/app/types';
import { useMemo } from 'react';

type Props = {
  appInfo: AppInfo;
};

export const QuickStartCard = ({ appInfo }: Props) => {
  const { isDashboardQuickStartEnabled } = useMagicLDFlags();

  const { data: appUsers } = useSignupAppUsersSuspenseQuery(
    appUsersQueryKey.signups({
      appId: appInfo.appId,
      appType: appInfo.appType,
    }),
  );

  const isDismissed = useMemo(() => {
    return !isDashboardQuickStartEnabled || appInfo.checklistFlags.is_quickstart_complete || appUsers.count > 10;
  }, [appInfo.checklistFlags.is_quickstart_complete, appUsers.count, isDashboardQuickStartEnabled]);

  if (isDismissed) {
    return null;
  }

  return appInfo.appType === PASSPORT_APP ? (
    <PassportQuickstart appInfo={appInfo} />
  ) : (
    <EmbeddedWalletQuickstart appInfo={appInfo} />
  );
};
