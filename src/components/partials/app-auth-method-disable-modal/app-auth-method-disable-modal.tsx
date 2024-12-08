import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { SwitchCase } from '@components/presentation/switch-case';
import { APP_AUTH_METHODS_METADATA } from '@constants/app-auth-methods';
import { APP_AUTH_METHOD_NAMES, AppType, AUTH_APP } from '@constants/appInfo';
import { useUpdateAppAuthMethodMutation } from '@hooks/data/app';
import { type AppAuthMethodName } from '@hooks/data/app/types';
import { Button, Text, useToast } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { create } from 'zustand';

interface AppFeatureDisableModalState {
  appId: string;
  appType: AppType;
  appAuthMethodName: AppAuthMethodName;
  isOpen: boolean;
  open: (name: AppAuthMethodName, appId: string, appType: AppType) => void;
  close: () => void;
}

export const useAppAuthMethodDisableModal = create<AppFeatureDisableModalState>()((set) => ({
  appId: '',
  appType: AUTH_APP,
  appAuthMethodName: APP_AUTH_METHOD_NAMES.LINK,
  isOpen: false,
  open: (name: AppAuthMethodName, appId: string, appType: AppType) =>
    set({
      appId,
      appType,
      isOpen: true,
      appAuthMethodName: name,
    }),
  close: () => set({ isOpen: false }),
}));

export const AppAuthMethodDisableModal = () => {
  const { createToast } = useToast();
  const { isOpen, appId, appType, close, appAuthMethodName } = useAppAuthMethodDisableModal();

  const metadata = APP_AUTH_METHODS_METADATA[appAuthMethodName];
  const Icon = metadata.icon;

  const { mutateAsync: updateAppAuthMethod, isPending } = useUpdateAppAuthMethodMutation();

  const handleDisable = async () => {
    await updateAppAuthMethod({
      appId,
      appType,
      name: appAuthMethodName,
      isActive: false,
    });

    createToast({
      message: `${metadata.label} disabled`,
      variant: 'neutral',
    });

    close();
  };

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={close} />
      <Stack boxSizing="border-box">
        <Stack gap={4} mb={10}>
          <Stack gap={6}>
            <Icon width={43} height={43} color={token('colors.negative.darker')} />
            <Text.H3 styles={{ color: token('colors.negative.darker') }}>Disable {metadata.label}?</Text.H3>
          </Stack>

          <SwitchCase
            value={appAuthMethodName}
            caseBy={{
              [APP_AUTH_METHOD_NAMES.METAMASK_WALLET]: (
                <Text>
                  <strong>All existing {metadata.label} users</strong> will immediately lose login access. No user IDs
                  or data will be deleted.
                </Text>
              ),
              [APP_AUTH_METHOD_NAMES.WALLET_CONNECT]: (
                <Text>
                  <strong>All existing {metadata.label} users</strong> will immediately lose login access. No user IDs
                  or data will be deleted.
                </Text>
              ),
            }}
            defaultComponent={
              <Text>
                <strong>New and existing users</strong> will no longer be able to connect with {metadata.label}.
              </Text>
            }
          />
        </Stack>

        <HStack gap={4} justifyContent="flex-end">
          <Button variant="neutral" label="Cancel" onPress={close} disabled={isPending} />
          <Button
            variant="negative"
            label={`Disable ${metadata.label}`}
            onPress={handleDisable}
            disabled={isPending}
            validating={isPending}
          />
        </HStack>
      </Stack>
    </Modal>
  );
};
