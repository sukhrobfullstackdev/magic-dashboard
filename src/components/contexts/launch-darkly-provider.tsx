import { LAUNCHDARKLY_SDK_CLIENT_SIDE_ID } from '@config';
import { DEFAULT_RQ_CUSTOM_CONFIG } from '@constants/react-query-conf';
import { useDashboardStore } from '@hooks/data/store/store';
import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asyncWithLDProvider, useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { useSearchParams } from 'next/navigation';
import { useEffect, type PropsWithChildren } from 'react';

type Props = PropsWithChildren;

type MagicLDFlagSet = {
  isDashboardQuickStartEnabled: boolean;
  isNewCustomizationPageEnabled: boolean;
  isLoginDebuggingEnabled: boolean;
  isEmailCustomizationEnabled: boolean;
  isTransactionSigningUiToggleDisabled: boolean;
  isUniversalAppCreationEnabled: boolean;
  securityOtpToggle: boolean;
  signTransactionToggle: boolean;
  isGoogleAutoLinkingEnabled: {
    enabled: boolean;
    isNew: boolean;
  };
  magicSelfServeMidTiers: boolean;
  isAvailableForPassportDevnet: boolean;
  isAvailableForPassportPublicTestnet: boolean;
};

export const useMagicLDFlags = useFlags<MagicLDFlagSet>;

const useInitializePassportFlow = () => {
  const { isAvailableForPassportDevnet, isAvailableForPassportPublicTestnet } = useMagicLDFlags();
  const { setIsPassportFlowEnabled } = useDashboardStore();

  useEffect(() => {
    setIsPassportFlowEnabled(isAvailableForPassportDevnet || isAvailableForPassportPublicTestnet);
  }, [isAvailableForPassportDevnet, isAvailableForPassportPublicTestnet]);
};

const Observerable = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const { teamId } = useDashboardStore();
  const appId = searchParams?.get('cid') as string | undefined;
  const queryClient = useQueryClient();
  const ldClient = useLDClient();
  useInitializePassportFlow();

  const { data: userInfo } = useUserInfoQuery(userQueryKeys.info());

  useEffect(() => {
    if (userInfo) {
      ldClient?.identify({
        kind: 'multi',
        user: {
          key: userInfo.id,
        },
        organization: {
          key: teamId ?? userInfo.teamId,
        },
      });
    }
  }, [appId, ldClient, queryClient, userInfo, teamId]);

  return <>{children}</>;
};

export const LaunchDarklyProvider = ({ children }: Props) => {
  const { data: Provider, isPending } = useQuery({
    queryKey: ['launch-darkly-provider'],
    queryFn: async () => {
      try {
        return await asyncWithLDProvider({
          clientSideID: LAUNCHDARKLY_SDK_CLIENT_SIDE_ID,
          context: {
            kind: 'multi',
            user: {
              key: 'fallback',
            },
            organization: {
              key: 'fallback',
            },
          },
          flags: {
            'is-dashboard-quick-start-enabled': false,
            'is-new-customization-page-enabled': false,
            'is-login-debugging-enabled': false,
            'is-email-customization-enabled': false,
            'is-transaction-signing-ui-toggle-disabled': false,
            'is-universal-app-creation-enabled': false,
            'security-otp-toggle': false,
            'sign-transaction-toggle': false,
            'is-google-auto-linking-enabled': {
              enabled: false,
              isNew: false,
            },
            'magic-self-serve-mid-tiers': false,
            'is-available-for-passport-devnet': false,
            'is-available-for-passport-public-testnet': false,
          },
          reactOptions: {
            useCamelCaseFlagKeys: true,
          },
        });
      } catch (error) {
        logger.error('There was an issue initializing launch darkly', {}, error as Error);
        return null;
      }
    },
    ...DEFAULT_RQ_CUSTOM_CONFIG,
  });

  if (isPending) {
    return <></>;
  }

  return Provider ? (
    <Provider>
      <Observerable>{children}</Observerable>
    </Provider>
  ) : (
    <>{children}</>
  );
};
