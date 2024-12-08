import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { Button, IcoBlock, IcoCheckmark, Text } from '@magiclabs/ui-components';
import { Box, Divider, HStack, Stack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState, type FC } from 'react';
import { v4 as createUuid } from 'uuid';

type Props = {
  showAccessListModal: boolean;
  dismissModal: () => void;
  accessList: string[];
  type: string;
};

export const AccessListModal: FC<Props> = ({ showAccessListModal, dismissModal, accessList, type }) => {
  const { currentApp } = useCurrentApp();
  const [displayedAccessList, setDisplayedAccessList] = useState<string[]>([]);
  const [loadMoreIndex, setLoadMoreIndex] = useState(0);

  useEffect(() => {
    if (accessList?.length <= 1000) {
      setDisplayedAccessList(accessList);
    } else {
      setDisplayedAccessList(accessList?.slice(0, 1000));
      setLoadMoreIndex(loadMoreIndex + 1);
    }
  }, [accessList, loadMoreIndex]);

  const loadMoreEntries = useCallback(() => {
    const newEntries = accessList.slice(loadMoreIndex * 1000, (loadMoreIndex + 1) * 1000);
    setLoadMoreIndex(loadMoreIndex + 1);
    setDisplayedAccessList([...displayedAccessList, ...newEntries]);
  }, [accessList, displayedAccessList, loadMoreIndex]);

  return (
    <Modal
      className={stack({
        h: '36rem',
        overflow: 'hidden',
      })}
      in={showAccessListModal}
      noPadding
    >
      <ModalCloseButton handleClose={dismissModal} />
      <Stack gap={6} alignItems="baseline" overflowY="auto">
        <Stack gap={2} px={10} pt={10}>
          <Text size="xs" fontColor="text.tertiary" fontWeight="semibold" styles={{ lineHeight: 1 }}>
            {currentApp?.appName.toUpperCase()}
          </Text>
          <Text.H3>{type.toLowerCase() === 'allow' ? 'Allow List' : 'Block List'}</Text.H3>
        </Stack>
        <Box mt={2} overflowY="auto" w="full" scrollbarWidth="thin">
          <Stack gap={0} px={10} pb={10}>
            {displayedAccessList?.map((entry, index) => (
              <Box key={`access-list-entry-${createUuid()}`}>
                {index !== 0 && <Divider my={4} color="neutral.tertiary" />}
                <HStack gap={2}>
                  {type?.toLowerCase() === 'allow' ? (
                    <IcoCheckmark width={16} height={16} color={token('colors.brand.base')} />
                  ) : (
                    <IcoBlock width={16} height={16} color={token('colors.neutral.primary')} />
                  )}
                  <Text truncate>{entry}</Text>
                </HStack>
              </Box>
            ))}
            {displayedAccessList?.length < accessList?.length && (
              <Box mt={6}>
                <Button variant="text" label="Load more entries" onPress={loadMoreEntries} />
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
};
