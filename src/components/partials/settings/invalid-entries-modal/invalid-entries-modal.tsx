import { Modal } from '@components/presentation/modal/modal';
import { Button, IcoWarningFill, Text } from '@magiclabs/ui-components';
import { Box, Divider, HStack, Stack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { type FC } from 'react';
import { v4 as createUuid } from 'uuid';

type Props = {
  invalidList: Array<string>;
  type: string;
};

const InvalidListEntries = ({ invalidList, type }: Props) => {
  return (
    <>
      {invalidList.map((invalid, index) => (
        <Box key={`${type.toLowerCase()}-invalid-${createUuid()}`}>
          {index !== 0 && <Divider my={4} color="neutral.tertiary" />}
          <HStack justifyContent="space-between">
            <HStack gap={2}>
              <IcoWarningFill width={16} height={16} color={token('colors.warning.base')} />
              <Text>{invalid}</Text>
            </HStack>
            <Text
              fontColor="text.tertiary"
              fontWeight="medium"
              size="sm"
              styles={{ textTransform: 'capitalize' }}
              truncate
            >
              {type} List
            </Text>
          </HStack>
        </Box>
      ))}
    </>
  );
};

interface InvalidEntriesModalProps {
  showInvalidEntriesModal: boolean;
  setShowInvalidEntriesModal: (bool: boolean) => void;
  invalidAllowListEmails: Array<string>;
  invalidBlockListEmails: Array<string>;
  persistAccessLists: () => void;
}

export const InvalidEntriesModal: FC<InvalidEntriesModalProps> = ({
  showInvalidEntriesModal,
  setShowInvalidEntriesModal,
  invalidAllowListEmails,
  invalidBlockListEmails,
  persistAccessLists,
}) => {
  const saveAndContinue = async () => {
    await persistAccessLists();
    setShowInvalidEntriesModal(false);
  };

  const numInvalidEntries = invalidAllowListEmails.length + invalidBlockListEmails.length;

  return (
    <Modal
      className={stack({
        h: '36rem',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      })}
      in={showInvalidEntriesModal}
      noPadding
    >
      <Stack h="full" justifyContent="space-between" overflow="hidden" gap={10}>
        <Stack gap={4} px={10} pt={10}>
          <Text.H3>
            {numInvalidEntries} invalid {numInvalidEntries === 1 ? 'entry ' : 'entries'}
          </Text.H3>
          <Stack gap={2}>
            <Text>
              The following entries are invalid or misformatted.
              <br />
              Unless corrected, these entries will be ignored.
            </Text>
            <Text size="sm" fontColor="text.tertiary">
              Required format: example@domain.com or *@domain.com
            </Text>
          </Stack>
        </Stack>

        <Stack h="full" overflow="hidden" justifyContent="space-between">
          <Box overflow="auto" scrollbarWidth="thin" w="full">
            <Stack gap={0} px={10} pb={10}>
              <InvalidListEntries invalidList={invalidAllowListEmails} type="allow" />
              {!!invalidAllowListEmails && !!invalidBlockListEmails && <Divider my={4} color="neutral.tertiary" />}
              <InvalidListEntries invalidList={invalidBlockListEmails} type="block" />
            </Stack>
          </Box>

          <HStack gap={4} px={10} pb={4} w="full" justifyContent="end">
            <Button onPress={saveAndContinue} label="Save and Ignore" variant="neutral" />
            <Button onPress={() => setShowInvalidEntriesModal(false)} label="Edit" />
          </HStack>
        </Stack>
      </Stack>
    </Modal>
  );
};
