'use client';

import { AppAuthMethodDisableModal } from '@components/partials/app-auth-method-disable-modal/app-auth-method-disable-modal';
import { AppAuthMethodEnabledModal } from '@components/partials/app-auth-method-enabled-modal/app-auth-method-enabled-modal';
import { MagicLoginCard } from '@components/views/magic-login-view/magic-login-card';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { type App } from '@hooks/data/user/types';
import { Text } from '@magiclabs/ui-components';
import { type AuthMethodName } from '@services/auth-method-config';
import { HStack, Stack } from '@styled/jsx';

const Resolved = ({ app }: { app: App }) => {
  const authMethodsAvailable: AuthMethodName[] = ['link', 'sms', 'webauthn'];

  return (
    <>
      <Stack p={8} gap={7}>
        <Stack gap={2}>
          <Text.H3>Passwordless Login</Text.H3>
          <Text fontColor="text.secondary">Enable secure passwordless login methods for your users</Text>
        </Stack>

        <HStack flexWrap="wrap" gap={5}>
          {authMethodsAvailable.map((v) => (
            <MagicLoginCard key={v} appId={app.appId} appType={app.appType} authMethodName={v} />
          ))}
        </HStack>
      </Stack>
      <AppAuthMethodEnabledModal />
      <AppAuthMethodDisableModal />
    </>
  );
};

export const MagicLoginView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
