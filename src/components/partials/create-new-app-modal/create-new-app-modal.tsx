import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { APP_LABEL, AUTH_APP, AppType, CONNECT_APP, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAllApps } from '@hooks/common/use-all-apps';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useUniversalProBundle } from '@hooks/common/use-universal-pro-bundle';
import { useCreateAppMutation } from '@hooks/data/app';
import { useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { generateDefaultAppName } from '@libs/generate-app-name';
import { Button, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { create } from 'zustand';
import { renderAppSelectCard, renderNewAppSelectCard } from './app-card';

type AppCreateForm = {
  appName: string;
  appType: AppType;
};

const schema = z.object({
  appName: z.string().min(1),
  appType: z.union([z.literal(AUTH_APP), z.literal(CONNECT_APP), z.literal(PASSPORT_APP), z.literal(EMBEDDED_APP)]),
});

type FormData = z.infer<typeof schema>;

interface CreateNewAppModalState {
  isOpen: boolean;
  defaultAppType?: AppType;
  open: (appType?: AppType) => void;
  close: () => void;
}

export const useCreateNewAppModal = create<CreateNewAppModalState>()((set, get) => ({
  isOpen: false,
  defaultAppType: undefined,
  open: (appType?: AppType) => set({ isOpen: true, defaultAppType: appType || get().defaultAppType }),
  close: () => set({ isOpen: false }),
}));

const Resolved = () => {
  const router = useRouter();
  const { isAvailableForPassportDevnet } = useMagicLDFlags();
  const { isOpen, close, defaultAppType } = useCreateNewAppModal();
  const { currentTeamId } = useCurrentTeam();
  const { allApps } = useAllApps();
  const { createToast } = useToast();
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { universalProBundle } = useUniversalProBundle({
    teamId: currentTeamId,
  });
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: currentTeamId }));
  const { isUniversalAppCreationEnabled } = useMagicLDFlags();

  const defaultAppName = generateDefaultAppName(allApps);
  const lastAppType = isAvailableForPassportDevnet ? PASSPORT_APP : AUTH_APP;
  const newAppType = defaultAppType ?? lastAppType;

  const { mutateAsync: createApp } = useCreateAppMutation({
    onSuccess: () => {
      createToast({
        message: 'Successfully created your app!',
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      appName: defaultAppName,
      appType: newAppType,
    },
  });

  useEffect(() => {
    reset({
      appName: defaultAppName,
      appType: newAppType,
    });
  }, [newAppType, defaultAppName]);

  const appName = watch('appName');
  const appType = watch('appType');
  const SelectedAppLogo = APP_LABEL[appType].Logo;

  const onClose = () => {
    setShowWalletSelector(false);
    close();
  };

  const onSubmit = handleSubmit(async (data: AppCreateForm) => {
    const { appId } = await createApp({
      email: userInfo.email,
      appName: data.appName,
      appType: data.appType,
      teamId: currentTeamId,
    });

    onClose();
    router.push(`/app?cid=${appId}`);
  });

  return (
    <Modal
      className={stack({
        overflowY: 'auto',
        boxSizing: 'border-box',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      })}
      in={isOpen}
      handleClose={close}
    >
      <ModalCloseButton handleClose={close} />
      <form onSubmit={onSubmit}>
        <>
          <Stack gap={10}>
            <Text.H3>Create a new app</Text.H3>
            <TextInput
              className={css({ mb: 6 })}
              id="app-name"
              placeholder="App name"
              errorMessage={errors.appName?.message}
              label="App Name"
              defaultValue={appName}
              {...register('appName')}
              onChange={(value) => register('appName').onChange({ target: { name: 'appName', value } })}
            />
          </Stack>

          {(isAvailableForPassportDevnet || teamInfo.isConnectAppEnabled) && (
            <Text size="sm" fontWeight="medium">
              Wallet Type
            </Text>
          )}

          {isAvailableForPassportDevnet ? (
            showWalletSelector ? (
              <Stack mt={2} gap={5}>
                {renderNewAppSelectCard(
                  appType,
                  PASSPORT_APP,
                  'Plug-and-play multi-chain smart wallet with global interoperability, live in minutes',
                  () => setValue('appType', PASSPORT_APP),
                )}
                {renderNewAppSelectCard(
                  appType,
                  EMBEDDED_APP,
                  'Create your ideal wallet experience with full end‑to‑end customization',
                  () => setValue('appType', EMBEDDED_APP),
                )}
              </Stack>
            ) : (
              <>
                <HStack bg="surface.secondary" h={15} gap={3} rounded="xl" p={4} mt={2}>
                  <SelectedAppLogo width={24} height={24} />
                  {APP_LABEL[appType].short}
                  <Box style={{ flex: 1 }} />
                  <Button variant="text" label="Switch" onPress={() => setShowWalletSelector(true)} />
                </HStack>
              </>
            )
          ) : teamInfo.isConnectAppEnabled ? (
            <Stack mt={2} gap={5}>
              {renderAppSelectCard(
                appType,
                AUTH_APP,
                [
                  'Fully customizable UI/UX',
                  '10+ auth methods or use your existing provider',
                  'Wallets and sign-on are scoped to your app',
                ],
                () => setValue('appType', AUTH_APP),
              )}
              {universalProBundle && isUniversalAppCreationEnabled ? (
                renderAppSelectCard(
                  appType,
                  CONNECT_APP,
                  [
                    'Co-branded, high conversion plug & play wallet',
                    'Built-in Google One Tap and 3rd-party wallets',
                    'Single sign-on across any Universal Wallet app',
                  ],
                  () => setValue('appType', CONNECT_APP),
                )
              ) : (
                <a href="https://magic.link/posts/unifyingwaas" target="_blank" rel="noopener noreferrer">
                  <Text variant="info" fontWeight="semibold">
                    Looking for Universal Wallet?
                  </Text>
                </a>
              )}
            </Stack>
          ) : null}

          <Flex justifyContent="flex-end" mt={11}>
            <Button
              type="submit"
              label="Create App"
              disabled={!appName.trim() || isSubmitting}
              validating={isSubmitting}
            />
          </Flex>
        </>
      </form>
    </Modal>
  );
};

export const CreateNewAppModal = () => {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
};
