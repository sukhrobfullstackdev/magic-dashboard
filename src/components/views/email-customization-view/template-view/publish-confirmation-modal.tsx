import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { Button, IconEmailGlobe, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { type FC } from 'react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  templateName: string;
}

export const PublishConfirmationModal: FC<Props> = ({ onConfirm, onCancel, isOpen, templateName }) => {
  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={onCancel} />
      <VStack alignItems="start" gap={4} mb={10}>
        <IconEmailGlobe width={48} height={48} />
        <Text.H3>Publish changes?</Text.H3>
        <Text>
          This email will be sent whenever a login is initiated using the <b>{templateName}</b> variation name.
        </Text>
        <Text>It may take a few minutes for updates to fully propagate.</Text>
      </VStack>

      <HStack justifyContent="end" gap={10}>
        <Button variant="text" label="Cancel" onPress={onCancel} />
        <Button label="Publish" onPress={onConfirm} />
      </HStack>
    </Modal>
  );
};
