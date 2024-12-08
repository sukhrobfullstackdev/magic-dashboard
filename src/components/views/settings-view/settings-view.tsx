'use client';

import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { AccessAllowlistCard } from '@components/partials/settings/access-allowlist-card';
import { ContentSecurityPolicyCard } from '@components/partials/settings/content-security-policy-card';
import { CustomEmailProviderCard } from '@components/partials/settings/custom-email-provider-card/custom-email-provider-card';
import { DeleteAppCard } from '@components/partials/settings/delete-app-card';
import { DeviceRegistrationCard } from '@components/partials/settings/device-registration-card';
import { LoginAccessCard } from '@components/partials/settings/login-access-card';
import { MagicLinkSecurityCheckCard } from '@components/partials/settings/magic-link-security-check-card';
import { SessionDurationCard } from '@components/partials/settings/session-duration-card';
import { SignConfirmationCard } from '@components/partials/settings/sign-confirmation-card';
import { EditAppNameCard } from '@components/views/settings-view/edit-app-name-card';
import { PASSPORT_APP } from '@constants/appInfo';
import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { usePlan } from '@hooks/common/use-plan';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { Stack } from '@styled/jsx';

const Resolved = ({ app }: { app: App }) => {
  const { securityOtpToggle, signTransactionToggle } = useMagicLDFlags();

  const { data: appInfo } = useAppInfoSuspenseQuery(appQueryKeys.info({ appId: app.appId, appType: app.appType }));
  const {
    plan: { planName },
  } = usePlan({
    teamId: app.teamId,
  });

  return (
    <Stack gap={6}>
      {appInfo.appType !== PASSPORT_APP && <EditAppNameCard app={app} />}
      {appInfo.appType !== PASSPORT_APP && (
        <>
          <AccessAllowlistCard app={app} />
          <ContentSecurityPolicyCard app_type={appInfo.appType} magic_client_id={appInfo.appId} />
        </>
      )}
      {isDedicatedApp(appInfo.appType) && (
        <>
          <DeviceRegistrationCard magic_client_id={appInfo.appId} live_secret_key={appInfo.liveSecretKey} />
          {signTransactionToggle && <SignConfirmationCard appInfo={appInfo} />}
          {securityOtpToggle && <MagicLinkSecurityCheckCard appInfo={appInfo} />}
          <CustomEmailProviderCard appInfo={appInfo} />
          <SessionDurationCard
            appId={appInfo.appId}
            isAuthPremiumEnabled={
              planName === PLAN_NAMES.STARTUP ||
              planName === PLAN_NAMES.GROWTH ||
              planName === PLAN_NAMES.LEGACY ||
              planName === PLAN_NAMES.ENTERPRISE
            }
          />
        </>
      )}
      {appInfo.appType !== PASSPORT_APP && <LoginAccessCard appId={appInfo.appId} />}
      {app.isOwner && <DeleteAppCard appId={appInfo.appId} appType={appInfo.appType} appName={appInfo.appName} />}
    </Stack>
  );
};

export const SettingsView = () => {
  const { currentApp } = useCurrentApp();

  return <Stack p={6}>{currentApp && <Resolved app={currentApp} />}</Stack>;
};
