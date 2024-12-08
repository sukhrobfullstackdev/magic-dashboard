'use client';

import { useLocalStorage } from '@components/hooks/use-localstorage';
import { PassportCallout } from '@components/partials/passport-callout/passport-callout';
import { BLOCKCHAIN_AUTH_SELECT_OPTIONS } from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-config';
import { StackedIcons } from '@components/presentation/stacked-icons/stacked-icons';
import { AuthMethodToggle } from '@components/views/create-your-first-app-view/auth-method-toggle';
import { AUTH_APP } from '@constants/appInfo';
import { PLAN_NAMES } from '@constants/pricing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAppMutation, useUpdateAppAuthMethodsMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { isSame } from '@libs/is-same';
import {
  Button,
  DropdownOption,
  DropdownSelector,
  FwkFirebase,
  IcoCaretDown,
  IconEmail,
  IconSms,
  LogoApple,
  LogoAuth0,
  LogoAzure,
  LogoCognito,
  LogoDiscord,
  LogoFacebook,
  LogoGoogle,
  Text,
  useToast,
} from '@magiclabs/ui-components';
import { getAuthConfig } from '@services/auth-method-config';
import { css } from '@styled/css';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  network: z.string(),
  enableEmailAuth: z.boolean(),
  enableSmsAuth: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export const CreateYourFirstAppView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [appNetworks, setAppNetworks] = useLocalStorage('app_network', {});
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { createToast } = useToast();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      network: BLOCKCHAIN_AUTH_SELECT_OPTIONS[0],
      enableEmailAuth: true,
      enableSmsAuth: false,
    },
  });
  const enableEmailAuth = watch('enableEmailAuth');
  const enableSmsAuth = watch('enableSmsAuth');
  const network = watch('network');

  const { mutateAsync: updateAppAuthMethods } = useUpdateAppAuthMethodsMutation();

  const { mutateAsync: createApp } = useCreateAppMutation({
    onSuccess: async ({ appId, appType }) => {
      try {
        const config = await getAuthConfig(appId);
        if (!config.data) {
          throw new Error('Failed to get auth config');
        }

        queryClient.setQueryData(
          appQueryKeys.authMethods({
            appId,
            appType,
          }),
          config.data.auth_methods,
        );

        await updateAppAuthMethods({
          appId,
          appType,
          authMethods: [
            ...config.data.auth_methods.filter((method) => method.name !== 'link' && method.name !== 'sms'),
            {
              name: 'link',
              is_active: enableEmailAuth,
            },
            {
              name: 'sms',
              is_active: enableSmsAuth,
            },
          ],
        });
      } catch (error) {
        logger.error('Failed to update auth methods.', {}, error as Error);
      }
    },
    onError: (error) => {
      createToast({
        message: error instanceof Error ? error.message : 'Something went wrong! Failed to create a first app.',
        variant: 'error',
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const { appId } = await createApp({
      email: userInfo.email,
      teamId: userInfo.teamId,
      appName: 'First App',
      appType: AUTH_APP,
    });

    setAppNetworks({ ...appNetworks, [appId]: data.network });

    const startWith = searchParams?.get('startWith');
    if (startWith && typeof startWith === 'string') {
      if (isSame(startWith, PLAN_NAMES.STARTUP)) {
        await router.push('/checkout/upgrade-to-startup');
      } else if (isSame(startWith, PLAN_NAMES.GROWTH)) {
        await router.push('/checkout/upgrade-to-growth');
      } else {
        await router.push(`/app?cid=${appId}`);
      }
    } else {
      await router.push(`/app?cid=${appId}`);
    }

    createToast({
      message: 'You just created your first app!',
      variant: 'success',
    });
  });

  return (
    <HStack alignItems="flex-start" w="fit-content" m="0 auto">
      {/* left side */}
      <Stack
        className={css({
          '@media screen and (max-width: 768px)': {
            pt: 5,
            px: 5,
            pb: '3.75rem',
          },
        })}
        flex={1}
        maxW="600px"
        p="3.75rem"
        gap={10}
        w="full"
      >
        <Stack gap={1}>
          <Text.H2>Create your first app</Text.H2>
          <Text size="lg" fontColor="text.tertiary">
            You can change the configurations later
          </Text>
        </Stack>

        <PassportCallout condense />

        <form
          className={css({ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.5 : 1 })}
          onSubmit={onSubmit}
        >
          <DropdownSelector
            disabled={isSubmitting}
            label="Network"
            viewMax={10}
            onSelect={(value) => {
              setValue('network', value as string);
            }}
            size="md"
            selectedValue={network}
          >
            {BLOCKCHAIN_AUTH_SELECT_OPTIONS.map((option) => (
              <DropdownOption key={option} label={option} value={option} />
            ))}
          </DropdownSelector>
          <Stack gap={4} mt={12} mb={isOpen ? 10 : 4}>
            <Text size="sm" fontWeight="medium">
              Auth methods
            </Text>
            <AuthMethodToggle
              value={enableEmailAuth}
              onChange={(v) => setValue('enableEmailAuth', v)}
              name="Email"
              icon={IconEmail}
            />
            <AuthMethodToggle
              value={enableSmsAuth}
              onChange={(v) => setValue('enableSmsAuth', v)}
              name="SMS"
              icon={IconSms}
            />
            <Box>
              <Button
                label={`View ${isOpen ? 'less' : 'more'}`}
                onPress={() => setIsOpen((prev) => !prev)}
                variant="text"
                iconSize={16}
              >
                <Button.TrailingIcon>
                  <IcoCaretDown
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </Button.TrailingIcon>
              </Button>
            </Box>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  className={stack({ gap: 4 })}
                  key="more-auth-methods"
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                >
                  <Stack gap={6}>
                    <Stack gap={4}>
                      <HStack justifyContent="space-between">
                        <Text size="lg" fontWeight="semibold">
                          Social Logins
                        </Text>
                        <StackedIcons>
                          <LogoGoogle />
                          <LogoApple />
                          <LogoFacebook />
                          <LogoDiscord />
                        </StackedIcons>
                      </HStack>
                      <Text fontColor="text.tertiary" styles={{ maxWidth: '300px' }}>
                        More social login options are available for setup in the dashboard.
                      </Text>
                    </Stack>

                    <Stack gap={4}>
                      <HStack justifyContent="space-between">
                        <Text size="lg" fontWeight="semibold">
                          Bring Your Own Auth
                        </Text>
                        <StackedIcons>
                          <LogoAuth0 />
                          <LogoCognito />
                          <LogoAzure />
                          <FwkFirebase />
                        </StackedIcons>
                      </HStack>
                      <Text fontColor="text.tertiary" styles={{ maxWidth: '300px' }}>
                        Available on our Growth and Enterprise Plans.{' '}
                        <a href="https://magic.link/contact" target="_blank" rel="noopener noreferrer">
                          <Button label="Contact us" variant="text" />
                        </a>{' '}
                        to set this up with your existing identity provider.
                      </Text>
                    </Stack>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>

          <Stack alignItems="flex-end" mt={10}>
            <Button size="lg" validating={isSubmitting} label="Get API Keys" type="submit" />
          </Stack>
        </form>
      </Stack>

      {/* right side content, it shows on desktop only */}
      <Flex
        className={css({
          '@media screen and (max-width: 1024px)': {
            display: 'none',
          },
        })}
        flex={1}
        p="3.75rem"
        pb={0}
      >
        <Image
          src="/images/onboarding_img/welcome_card.png"
          alt="welcome to magic dashboard"
          priority
          width={720}
          height={800}
          style={{ width: '100%', maxWidth: '720px' }}
        />
      </Flex>
    </HStack>
  );
};
