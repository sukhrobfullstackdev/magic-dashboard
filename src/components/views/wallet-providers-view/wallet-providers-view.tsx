'use client';

import { AppAuthMethodDisableModal } from '@components/partials/app-auth-method-disable-modal/app-auth-method-disable-modal';
import { AppAuthMethodEnabledModal } from '@components/partials/app-auth-method-enabled-modal/app-auth-method-enabled-modal';
import { WalletProviderCard } from '@components/views/wallet-providers-view/wallet-provider-card';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { type App } from '@hooks/data/user/types';
import { Text } from '@magiclabs/ui-components';
import { type AuthMethodName } from '@services/auth-method-config';
import { HStack, Stack } from '@styled/jsx';

const Resolved = ({ app }: { app: App }) => {
  const authMethodsAvailable: AuthMethodName[] = ['metamask_wallet', 'coinbase_wallet'];

  return (
    <Stack p={8} gap={7}>
      <Stack gap={2}>
        <Text.H3>Wallet Providers</Text.H3>
        <Text fontColor="text.secondary">
          Enable wallet providers to allow users to connect with an existing wallet
        </Text>
      </Stack>

      <HStack flexWrap="wrap" gap={5}>
        {authMethodsAvailable.map((v) => (
          <WalletProviderCard key={v} appId={app.appId} appType={app.appType} authMethodName={v} />
        ))}
      </HStack>

      <AppAuthMethodEnabledModal />
      <AppAuthMethodDisableModal />
    </Stack>
  );
};

export const WalletProvidersView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
