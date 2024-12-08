import { type AllowlistEntryType } from '@components/partials/settings/access-allowlist-card/access-allowlist-card';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { Button, IcoTrash, Text } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';

type AllowListEntryRemoveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entryToBeRemoved: { entry: string; type: AllowlistEntryType };
};

export const AllowListEntryRemoveModal = ({
  isOpen,
  onClose,
  onConfirm,
  entryToBeRemoved,
}: AllowListEntryRemoveModalProps) => {
  const { currentApp } = useCurrentApp();
  const isMobilePortrait = window.matchMedia('( max-width: 500px )')?.matches;

  return (
    <Modal in={isOpen}>
      <Stack gap={10}>
        <ModalCloseButton handleClose={onClose} />
        <Stack gap={4}>
          <IcoTrash width={42} height={42} color={token('colors.negative.darker')} />
          <Text.H3>Remove domain?</Text.H3>
          <Text>
            <b>{entryToBeRemoved.entry}</b> will be blocked from using <b>{currentApp?.appName}</b> API keys.
          </Text>
          <Text variant="error">Update will not go into effect until changes are saved</Text>
        </Stack>

        <HStack w="full" justifyContent="end" gap={4}>
          <Button onPress={onClose} size={isMobilePortrait ? 'sm' : 'md'} label="Cancel" variant="neutral" />
          <Button onPress={onConfirm} size={isMobilePortrait ? 'sm' : 'md'} label="Remove" variant="negative" />
        </HStack>
      </Stack>
    </Modal>
  );
};
