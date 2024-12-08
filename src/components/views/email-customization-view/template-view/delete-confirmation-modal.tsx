'use client';

import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { Button, IconDelete, Text, useToast } from '@magiclabs/ui-components';
import { deleteTemplate } from '@services/custom-message-template-v2';
import { HStack, VStack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { useState, type FC } from 'react';
import { useEmailCustomizationTracking } from '../useEmailCustomizationTracking';

interface Props {
  onCancel: () => void;
  isOpen: boolean;
  templateName: string;
  templateId: string;
  bindingId: string;
  linesOfHtml: number;
  magic_client_id: string;
}

export const DeleteConfirmationModal: FC<Props> = ({
  onCancel,
  isOpen,
  templateName,
  templateId,
  bindingId,
  linesOfHtml,
  magic_client_id,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { createToast } = useToast();
  const { track } = useEmailCustomizationTracking();

  const handleDelete = async () => {
    setIsDeleting(true);
    track({ action: 'template deleted', data: { templateName, linesOfHtml } });
    const response = await deleteTemplate(magic_client_id, bindingId, templateId);

    if (response.error) {
      createToast({
        message: `Error deleting template: ${response.error}`,
        variant: 'error',
        lifespan: 7000,
      });
    } else {
      onCancel();
      router.push(`/app/email_customization?cid=${magic_client_id}`);

      createToast({
        message: 'Template deleted',
        variant: 'success',
        lifespan: 3000,
      });
    }

    setIsDeleting(false);
  };

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={onCancel} />
      <VStack alignItems="start" gap={4} mb={10}>
        <IconDelete width={48} height={48} />
        <Text.H3>Delete custom template?</Text.H3>
        <Text>
          Your <b>{templateName}</b> custom email template will be permanently deleted.
        </Text>
        <Text variant="error" fontWeight="bold">
          {linesOfHtml} line{linesOfHtml === 1 ? '' : 's'} of custom HTML will be lost.
        </Text>
      </VStack>

      <HStack justifyContent="end" gap={4}>
        <Button variant="neutral" label="Cancel" onPress={onCancel} />
        <Button variant="negative" label="Delete" onPress={handleDelete} disabled={isDeleting} />
      </HStack>
    </Modal>
  );
};
