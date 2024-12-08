import { useAnalytics } from '@components/hooks/use-analytics';
import { useConfetti } from '@components/hooks/use-confetti';
import { CallToActionWithCheck } from '@components/partials/quickstart-embedded-wallet/call-to-action-with-check';
import { CodeBlockThemed } from '@components/partials/quickstart-embedded-wallet/code-block-themed';
import {
  QUICKSTART_LINKS,
  getCLIInitCode,
} from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-config';
import { AUTH_APP, CONNECT_APP } from '@constants/appInfo';
import {
  useAuthMethodsSuspenseQuery,
  useDismissQuickStartMutation,
  useUpdateAppAuthMethodMutation,
} from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type AppInfo } from '@hooks/data/app/types';
import { logger } from '@libs/datadog';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { Switch, Text, useToast } from '@magiclabs/ui-components';
import { type AuthMethodName } from '@services/auth-method-config';
import { css } from '@styled/css';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { useCallback } from 'react';

type AuthMethodCardProps = { title: string; onPress?: () => void; checked?: boolean; disabled?: boolean };

const AuthMethodCard = ({ title, onPress = () => {}, checked, disabled = false }: AuthMethodCardProps) => (
  <HStack
    gap={4}
    boxSizing="border-box"
    px={4}
    py={2}
    borderWidth="thin"
    borderColor="neutral.secondary"
    rounded="lg"
    minW="fit-content"
    opacity={disabled ? 0.6 : 1}
  >
    <Box minW="3.75rem">
      <Text size="sm" fontWeight="medium">
        {title}
      </Text>
    </Box>
    <Switch checked={checked} onPress={onPress} disabled={disabled} />
  </HStack>
);

type QuickstartCLIProps = {
  appInfo: AppInfo;
  network: string;
};

export const QuickstartCLI = ({ appInfo, network }: QuickstartCLIProps) => {
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();
  const showConfetti = useConfetti();

  const { data: authMethods } = useAuthMethodsSuspenseQuery(
    appQueryKeys.authMethods({
      appId: appInfo.appId,
      appType: appInfo.appType,
    }),
  );

  const { mutateAsync: dismissQuickStart } = useDismissQuickStartMutation({
    onError: (error, params, context) => {
      logger.error('Failed to dismiss Quick Start', { params, context }, error);

      createToast({
        message: 'Failed to dismiss Quick Start',
        variant: 'success',
      });
    },
  });

  const { mutateAsync: updateAuthConfig } = useUpdateAppAuthMethodMutation({
    onSuccess: () => {
      trackAction('quickstartAuthConfigUpdated');
    },
  });

  const toggleAuthConfig = useCallback(
    async (authMethodName: AuthMethodName) => {
      const isActive = authMethods.find((v) => v.name === authMethodName)?.is_active;
      await updateAuthConfig({
        appId: appInfo.appId,
        appType: appInfo.appType,
        name: authMethodName,
        isActive: !isActive,
      });
    },
    [authMethods, updateAuthConfig, appInfo.appId],
  );

  const handleMarkAsComplete = useCallback(async () => {
    await dismissQuickStart({
      appId: appInfo.appId,
      appType: appInfo.appType,
    });

    trackAction('CLI Quickstart Completed');
    showConfetti();
    createToast({
      message: 'Well done! Happy building!',
      variant: 'success',
    });
  }, [appInfo.appId, dismissQuickStart, showConfetti, createToast, trackAction]);

  return (
    <Stack gap={5}>
      <Text fontColor="text.tertiary">
        Get started with the Magic CLI tool, which includes a built-in environment setup and everything you need to get
        started with just one line of code. To learn more, check out our{' '}
        <a
          href={QUICKSTART_LINKS.DOCS_CLI_DEMO[appInfo.appType]}
          rel="noopener noreferrer"
          target="_blank"
          className={css({ color: 'brand.base', _hover: { textDecoration: 'underline' } })}
        >
          quickstart docs and video
        </a>
        .
      </Text>

      <Flex flexWrap="wrap" gap={3}>
        <AuthMethodCard
          title="Email"
          onPress={() => toggleAuthConfig('link')}
          disabled={appInfo.appType !== AUTH_APP}
          checked={authMethods.find((v) => v.name === 'link')?.is_active}
        />
        <AuthMethodCard
          title="SMS"
          onPress={() => toggleAuthConfig('sms')}
          disabled={appInfo.appType !== AUTH_APP}
          checked={authMethods.find((v) => v.name === 'sms')?.is_active}
        />
        {appInfo.appType === CONNECT_APP && (
          <>
            <AuthMethodCard
              title="MetaMask"
              onPress={() => toggleAuthConfig('metamask_wallet')}
              checked={authMethods.find((v) => v.name === 'metamask_wallet')?.is_active}
            />
            <AuthMethodCard
              title="Coinbase Wallet"
              onPress={() => toggleAuthConfig('coinbase_wallet')}
              checked={authMethods?.find((v) => v.name === 'coinbase_wallet')?.is_active}
            />
          </>
        )}
      </Flex>

      <CodeBlockThemed
        codeString={getCLIInitCode(
          appInfo.appType,
          appInfo.liveApiKey,
          network,
          isDedicatedApp(appInfo.appType) ? authMethods?.filter((v) => v.is_active).map((v) => v.name) : null,
        )}
        language="javascript"
      />

      <CallToActionWithCheck onPress={handleMarkAsComplete} text="Mark as complete" />
    </Stack>
  );
};
