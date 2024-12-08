'use client';
import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import AppImage from '@components/views/welcome-view/app-image';
import SelectApp from '@components/views/welcome-view/select-app';
import WelcomeHeader from '@components/views/welcome-view/welcome-header';
import { AppType, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useCreateAppMutation } from '@hooks/data/app';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { Button, useToast } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type AppCreateForm = {
  appType: AppType;
};

const schema = z.object({
  appType: z.union([z.literal(PASSPORT_APP), z.literal(EMBEDDED_APP)]),
});

type FormData = z.infer<typeof schema>;

const WelcomeView = () => {
  const router = useRouter();
  const [initialLoad, setInitialLoad] = useState(true);
  const { isAvailableForPassportPublicTestnet } = useMagicLDFlags();
  const { createToast } = useToast();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeamId } = useCurrentTeam();

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      appType: EMBEDDED_APP,
    },
  });

  const appType = watch('appType') as AppType;

  const { mutateAsync: createApp } = useCreateAppMutation({
    onSuccess: () => {
      createToast({
        message: 'New app created',
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      logger.error(
        'Failed to create app',
        {
          params,
          context,
        },
        error,
      );
      createToast({
        message: 'Failed to create your app.',
        variant: 'error',
      });
    },
  });

  const onSubmit = handleSubmit(async (data: AppCreateForm) => {
    const { appId } = await createApp({
      email: userInfo.email,
      appName: 'My app',
      appType: data.appType,
      teamId: currentTeamId,
    });

    router.push(`/app?cid=${appId}`);
  });

  useEffect(() => {
    // Allows time for LD flags to initialize before re-routing. Can be removed once public testnet is live.
    if (initialLoad) {
      setTimeout(() => {
        setInitialLoad(false);
      }, 1000);
      return;
    }

    if (!isAvailableForPassportPublicTestnet) {
      router.push('/login');
    }
  }, [isAvailableForPassportPublicTestnet, initialLoad, router]);

  return (
    isAvailableForPassportPublicTestnet && (
      <HStack h="70vh" px={10} justifyContent="space-between" w="full" maxW="1200px" lgDown={{ w: 'fit-content' }}>
        <form onSubmit={onSubmit}>
          <Stack gap={12}>
            <WelcomeHeader />
            <SelectApp selectedAppType={appType} setValue={setValue} />
            <Button
              size="lg"
              type="submit"
              expand
              label="Get Started"
              disabled={isSubmitting}
              validating={isSubmitting}
            />
          </Stack>
        </form>
        <Box lgDown={{ display: 'none' }}>
          <AppImage appType={appType} />
        </Box>
      </HStack>
    )
  );
};

export default WelcomeView;
