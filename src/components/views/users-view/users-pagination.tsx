import { UserTable } from '@components/views/users-view/user-table';
import { appearFromBottom } from '@constants/animates';
import { AppType } from '@constants/appInfo';
import { useSignupAppUsersSuspenseQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { Button, IcoCaretLeft, IcoCaretRight, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Flex, HStack, Stack } from '@styled/jsx';
import { center, stack } from '@styled/patterns';
import { useDebounce } from '@uidotdev/usehooks';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';

type UsersPaginationProps = {
  appId: string;
  appType: AppType;
};

const PAGE_SIZE = 10;
// const PAGE_SIZE = 1;

const useUsersPagination = ({ appId }: { appId: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const debounce = useDebounce(currentPage, 700);

  const queryKey = appUsersQueryKey.signups({
    appId,
    limit: PAGE_SIZE,
    offset: (debounce - 1) * PAGE_SIZE,
  });

  const { data, ...rest } = useSignupAppUsersSuspenseQuery(queryKey);

  const totalPages = useMemo(() => {
    return Math.ceil(data.count / PAGE_SIZE);
  }, [data.count]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const nextPage = useCallback(() => setCurrentPage((prev) => prev + 1), []);

  const prevPage = useCallback(() => setCurrentPage((prev) => prev - 1), []);

  return {
    users: data.users,
    currentPage,
    setCurrentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalPages,
    queryKey,
    ...rest,
  };
};

export const UsersPagination = ({ appId, appType }: UsersPaginationProps) => {
  const {
    users,
    isPending,
    currentPage,
    setCurrentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalPages,
    queryKey,
  } = useUsersPagination({
    appId,
  });

  return (
    <Stack gap={8} mt={6}>
      <AnimatePresence mode="wait">
        {isPending && (
          <motion.div
            key={`loading-users-${currentPage}`}
            className={center({ pt: 6, px: 4, pb: 2 })}
            {...appearFromBottom}
          >
            <LoadingSpinner />
          </motion.div>
        )}
        {users && (
          <motion.div key={`table-with-pagination-${currentPage}`} className={stack({ gap: 6 })} {...appearFromBottom}>
            <UserTable appType={appType} data={[...users]} queryKey={queryKey} />
          </motion.div>
        )}
      </AnimatePresence>

      <HStack justifyContent="space-between">
        <HStack gap={1.5}>
          <Text size="sm" fontColor="text.tertiary">
            Page
          </Text>
          <TextInput
            className={css({ w: 10 })}
            value={currentPage.toString()}
            size="sm"
            aria-label="page input"
            onChange={(val) => {
              const value = +val;
              if (isNaN(value)) {
                setCurrentPage(1);
                return;
              }

              if (value < 1) {
                setCurrentPage(1);
                return;
              }

              if (value > totalPages) {
                setCurrentPage(totalPages);
                return;
              }

              setCurrentPage(value);
            }}
          />
          <Text size="sm" fontColor="text.tertiary">
            of {totalPages}
          </Text>
        </HStack>

        <Flex gap={4}>
          <Button variant="neutral" size="sm" onPress={prevPage} disabled={!hasPrevPage}>
            <Button.LeadingIcon>
              <IcoCaretLeft />
            </Button.LeadingIcon>
          </Button>
          <Button variant="neutral" size="sm" onPress={nextPage} disabled={!hasNextPage}>
            <Button.LeadingIcon>
              <IcoCaretRight />
            </Button.LeadingIcon>
          </Button>
        </Flex>
      </HStack>
    </Stack>
  );
};
