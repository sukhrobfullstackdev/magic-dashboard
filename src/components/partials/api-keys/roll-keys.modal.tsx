import { useAnalytics } from '@components/hooks/use-analytics';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { AppType, PASSPORT_APP } from '@constants/appInfo';
import { useRollKeysMutation } from '@hooks/data/app';
import { Button, Callout, IconReset, Text, useToast } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback } from 'react';

type RollKeysModalProps = {
  appId: string;
  appType: AppType;
  appKeyId?: string;
  isOpened: boolean;
  setIsOpened: (value: boolean) => void;
};

const rollKeysText = {
  PASSPORT_APP: {
    title: 'Roll Secret Key?',
    body: (
      <>
        By continuing, your <b>secret key</b> will no longer work.
      </>
    ),
    button: 'Roll Secret Key',
    toast: {
      success: 'New secret key generated!',
      error: 'Failed to regenerate secret key',
    },
  },
  OTHER_APP_TYPE: {
    title: 'Roll All Keys?',
    body: (
      <>
        By continuing, your <b>publishable API key</b> and <b>secret key</b> will no longer work.
      </>
    ),
    button: 'Roll Keys',
    toast: {
      success: 'New keys generated!',
      error: 'Failed to regenerate keys',
    },
  },
};

const getRollKeysText = (appType: AppType) =>
  appType === PASSPORT_APP ? rollKeysText.PASSPORT_APP : rollKeysText.OTHER_APP_TYPE;

export const RollKeysModal = ({ appId, appType, appKeyId, isOpened, setIsOpened }: RollKeysModalProps) => {
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();
  const text = getRollKeysText(appType);

  const { mutateAsync: rollKeys } = useRollKeysMutation({
    onSuccess: () => {
      trackAction('Roll Keys Confirm Clicked');
      createToast({
        message: text.toast.success,
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: text.toast.error,
        variant: 'error',
      });
    },
  });

  const handleRollKeys = useCallback(async () => {
    await rollKeys({ appId, appType, appKeyId });
    setIsOpened(false);
  }, [appId, appType, appKeyId, rollKeys]);

  return (
    <Modal in={isOpened}>
      <ModalCloseButton handleClose={() => setIsOpened(false)} />
      <Stack gap={10}>
        <Stack gap={4}>
          <IconReset width={48} height={48} />
          <Text.H3 styles={{ color: token('colors.negative.darker') }}>{text.title}</Text.H3>
          <Text>{text.body}</Text>
          <Callout icon variant="error" label="This action cannot be undone." />
        </Stack>
        <HStack gap={4} w="full" justifyContent="end">
          <Button size="lg" id="btn-cancel" onPress={() => setIsOpened(false)} label="Cancel" variant="neutral" />
          <Button size="lg" id="btn-roll-keys" onPress={handleRollKeys} label={text.button} variant="negative" />
        </HStack>
      </Stack>
    </Modal>
  );
};
