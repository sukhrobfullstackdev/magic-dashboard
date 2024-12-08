import { useAnalytics } from '@components/hooks/use-analytics';
import { FormCard } from '@components/presentation/form-card';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { AppType } from '@constants/appInfo';
import { useDeleteAppMutation } from '@hooks/data/app';
import { Button, Callout, IconDelete, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type Props = {
  appId: string;
  appType: AppType;
  appName: string;
};

export const DeleteAppCard = ({ appId, appType, appName }: Props) => {
  const router = useRouter();
  const [isDeleteConfirmShown, setIsDeleteConfirmShown] = useState(false);
  const [appNameInput, setAppNameInput] = useState('');
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();

  const { mutateAsync: deleteApp, isPending } = useDeleteAppMutation({
    onMutate: () => {
      trackAction('App Deleted');
    },
    onSuccess: () => {
      createToast({
        message: 'App deleted',
        variant: 'success',
      });

      setIsDeleteConfirmShown(false);
      router.push('/app/all_apps');
    },
    onError: () => {
      createToast({
        message: 'Failed to delete app',
        variant: 'success',
      });
    },
  });

  const isAppNameMatch = useCallback((value: string) => value === appName, [appName]);

  const handleDeleteApp = useCallback(async () => {
    if (!isAppNameMatch(appNameInput)) return;

    await deleteApp({
      appId,
      appType,
    });
  }, [appId, deleteApp, appNameInput]);

  const handleOpenModal = useCallback(() => {
    setIsDeleteConfirmShown(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDeleteConfirmShown(false);
    setAppNameInput('');
  }, []);

  return (
    <Box id="card-delete-app">
      <FormCard
        condensed
        title={<span style={{ color: token('colors.negative.darker') }}>Danger Zone</span>}
        customAction={
          <>
            <Button variant="negative" size="sm" label="Delete App" onPress={handleOpenModal} />

            <Modal in={isDeleteConfirmShown}>
              <ModalCloseButton handleClose={handleCloseModal} />
              <Stack gap={10}>
                <Stack gap={4}>
                  <IconDelete width={48} height={48} />
                  <Text.H3 styles={{ color: token('colors.negative.darker') }}>Delete {appName}?</Text.H3>
                  <Text>By deleting, your API keys will no longer work.</Text>
                  <Callout variant="error" icon label="This action cannot be undone." />
                </Stack>

                <Stack gap={4}>
                  <Text>To proceed, please enter the app’s name to confirm deletion.</Text>
                  <TextInput
                    size="lg"
                    onChange={(name) => setAppNameInput(name)}
                    placeholder={appName}
                    label="App Name"
                  />
                </Stack>

                <HStack gap={4} w="full" justifyContent="end">
                  <Button size="lg" onPress={handleCloseModal} label="Cancel" variant="neutral" />
                  <Button
                    size="lg"
                    onPress={handleDeleteApp}
                    disabled={!isAppNameMatch(appNameInput) || isPending}
                    validating={isPending}
                    label="Delete App"
                    variant="negative"
                  />
                </HStack>
              </Stack>
            </Modal>
          </>
        }
      />
    </Box>
  );
};
