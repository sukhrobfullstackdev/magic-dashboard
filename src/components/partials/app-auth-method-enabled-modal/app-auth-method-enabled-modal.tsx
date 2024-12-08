import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { APP_AUTH_METHODS_METADATA } from '@constants/app-auth-methods';
import { APP_AUTH_METHOD_NAMES } from '@constants/appInfo';
import { type AppAuthMethodName } from '@hooks/data/app/types';
import { Button, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';
import { create } from 'zustand';

interface AppFeatureEnabledModalState {
  appAuthMethodName: AppAuthMethodName;
  isOpen: boolean;
  open: (name: AppAuthMethodName) => void;
  close: () => void;
}

export const useAppAuthMethodEnabledModal = create<AppFeatureEnabledModalState>()((set) => ({
  appAuthMethodName: APP_AUTH_METHOD_NAMES.LINK,
  isOpen: false,
  open: (name: AppAuthMethodName) =>
    set({
      isOpen: true,
      appAuthMethodName: name,
    }),
  close: () => set({ isOpen: false }),
}));

export const AppAuthMethodEnabledModal = () => {
  const { isOpen, close, appAuthMethodName } = useAppAuthMethodEnabledModal();

  const metadata = APP_AUTH_METHODS_METADATA[appAuthMethodName];
  const Icon = metadata.icon;

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={close} />
      <VStack boxSizing="border-box" w="full" gap={10}>
        <VStack gap={4}>
          <Icon width={43} height={43} color={token('colors.brand.base')} />
          <Text.H3>{metadata.label} enabled</Text.H3>
          <Text styles={{ textAlign: 'center' }}>
            <Link
              className={css({ fontWeight: 600, color: 'brand.base' })}
              target="_blank"
              href={metadata.docUrl}
              rel="noreferrer"
            >
              Visit Magic docs
            </Link>{' '}
            to build a demo in minutes or integrate with your existing app.
          </Text>
        </VStack>
        <Button size="lg" label="Back to Dashboard" onPress={close} />
      </VStack>
    </Modal>
  );
};
