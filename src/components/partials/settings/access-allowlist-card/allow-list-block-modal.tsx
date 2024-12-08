import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { Button, IconWarning, Text } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';

type AllowListBlockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const AllowListBlockModal = ({ isOpen, onClose, onConfirm }: AllowListBlockModalProps) => {
  const isMobilePortrait = window.matchMedia('( max-width: 500px )')?.matches;

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={onClose} />
      <Stack gap={10}>
        <Stack gap={4}>
          <IconWarning width={48} height={48} />
          <Text.H3>Block all origins and redirects?</Text.H3>
          <Text>No origins or redirects have been added to your allowlist.</Text>
          <Text fontWeight="bold">
            If you continue, your API keys will be blocked from all publicly-accessible domains.
          </Text>
          <Text variant="error" fontWeight="bold">
            Are you sure you want to continue?
          </Text>
        </Stack>

        <HStack w="full" justifyContent="end" gap={4}>
          <Button onPress={onClose} size={isMobilePortrait ? 'sm' : 'md'} label="Cancel" variant="neutral" />
          <Button onPress={onConfirm} size={isMobilePortrait ? 'sm' : 'md'} label="Continue" variant="negative" />
        </HStack>
      </Stack>
    </Modal>
  );
};
