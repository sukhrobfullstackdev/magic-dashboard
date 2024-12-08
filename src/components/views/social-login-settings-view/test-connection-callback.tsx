'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { CodeBlockThemed } from '@components/partials/quickstart-embedded-wallet/code-block-themed';
import { providerConfigs } from '@components/views/social-login-settings-view/provider-configs';
import { getOAuthMagicInstance } from '@libs/magic-sdk';
import { Button, Text } from '@magiclabs/ui-components';
import { getClientInfo } from '@services/client';
import { Box, VStack } from '@styled/jsx';
import { useQuery } from '@tanstack/react-query';
import { ExtensionError } from 'magic-sdk';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const SocialLoginTestConnectionCallbackView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [magicClientId, setMagicClientId] = useState('');
  const [provider, setProvider] = useState('');

  const { trackAction } = useAnalytics();

  useEffect(() => {
    const clientId = searchParams?.get('cid') as string;
    const oauthProvider = searchParams?.get('provider') as string;
    if (clientId && !magicClientId) {
      setMagicClientId(clientId);
    }
    if (oauthProvider && !provider) {
      setProvider(oauthProvider);
    }
  }, [searchParams]);

  const {
    data: oauthProfile,
    isLoading,
    isError,
    isPending,
  } = useQuery({
    queryKey: ['oauth-profile', magicClientId, provider],
    queryFn: async () => {
      try {
        const app = await getClientInfo(magicClientId);

        if (!app || !app.live_api_key) {
          throw new Error('Invalid client');
        }

        const magic = getOAuthMagicInstance(app.live_api_key);
        if (!magic) {
          throw new Error('Cannot initialize Magic SDK');
        }

        const oauthRedirectResult = await magic.oauth2.getRedirectResult();
        const providerConfig = providerConfigs[oauthRedirectResult?.oauth.provider];

        trackAction(`${providerConfig.labels.provider} Signin - Test Connection Success`);

        const { ...userInfo } = oauthRedirectResult.oauth.userInfo;

        return JSON.stringify(
          {
            ...oauthRedirectResult,
            oauth: {
              ...oauthRedirectResult.oauth,
              userInfo: {
                ...userInfo,
              },
            },
          },
          null,
          2,
        );
      } catch (error) {
        if (error instanceof ExtensionError) {
          router.push(`/app/social_login/${provider}?test_connection_failed=${provider}&cid=${magicClientId}`);
          return null;
        }

        router.push(`/app/social_login/${provider}?cid=${magicClientId}`);
        return null;
      }
    },
    enabled: Boolean(magicClientId) && Boolean(provider),
  });

  const closeTestConnectionCallbackPage = useCallback(() => {
    router.push(`/app/social_login?cid=${magicClientId}`);
  }, [magicClientId]);

  if (isLoading || isPending) {
    return (
      <VStack
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        w="100vw"
        overflow="scroll"
        p={5}
        justifyContent="center"
        bgColor="surface.primary"
      >
        <Text.H3>Loading...</Text.H3>
      </VStack>
    );
  }

  if (isError) {
    return (
      <VStack
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        w="100vw"
        overflow="scroll"
        p={5}
        justifyContent="center"
        bgColor="surface.primary"
      >
        <Text.H3>Something went wrong!</Text.H3>
      </VStack>
    );
  }

  return (
    <VStack
      position="fixed"
      top="0"
      left="0"
      h="100vh"
      w="100vw"
      overflow="scroll"
      p={5}
      bgColor="surface.primary"
      gap={8}
    >
      <Image
        height={143}
        width={200}
        src="/images/jonah-hill-excited.gif"
        alt="Animated gif of Jonah Hill being excited"
        unoptimized
      />
      <Text.H2>Success! 🎉</Text.H2>

      <Text>Your Social Login connection worked! Your app will receive this user profile:</Text>

      <Box maxW="720px" w="calc(100% - 20px)" mb={5}>
        {oauthProfile && <CodeBlockThemed codeString={oauthProfile} language="json" />}
      </Box>

      <Button size="sm" onPress={closeTestConnectionCallbackPage} label="Nice job! Close this" />
    </VStack>
  );
};
