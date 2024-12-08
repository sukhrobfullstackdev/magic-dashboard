import { EndUserInfoRow } from '@components/partials/end-user-info-row';
import { useAppUsersSuspenseQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { AppInfo } from '@hooks/data/app/types';
import { formatToDateWithTimestamp } from '@libs/date';
import { Card, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack, Stack } from '@styled/jsx';
import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';

type Props = {
  appInfo: AppInfo;
};

const Fallback = () => {
  return (
    <Stack gap={4}>
      {[...Array(2)].map((_, index) => (
        // skipcq: JS-0437
        <HStack key={`skeleton-${index}`} justifyContent="space-between">
          <HStack gap={2}>
            <Skeleton height={24} width={24} />
            <Skeleton height={24} width={140} />
          </HStack>
          <Skeleton height={24} width={140} />
        </HStack>
      ))}
    </Stack>
  );
};

const Resolved = ({ appInfo }: Props) => {
  const { appName, appId } = appInfo;
  const { data: appUsers } = useAppUsersSuspenseQuery(
    appUsersQueryKey.app({
      appId,
    }),
  );

  return (
    <Stack gap={4}>
      {appUsers.length === 0 ? (
        <Text size="sm" fontColor="text.tertiary">
          No one signed up on <span className={css({ fontWeight: 'semibold' })}>{appName}</span> yet!
        </Text>
      ) : (
        <>
          {appUsers.map((user) => (
            <HStack key={user.loggedInAt.getTime()} gap={6} justifyContent="space-between">
              <EndUserInfoRow
                user={{
                  id: user.userId,
                  provenance: user.provenance,
                }}
              />
              <Text size="sm" fontColor="text.tertiary" styles={{ textWrap: 'nowrap' }}>
                {formatToDateWithTimestamp(user.loggedInAt)}
              </Text>
            </HStack>
          ))}
        </>
      )}
    </Stack>
  );
};

export const DedicatedLoginsCard = ({ appInfo }: Props) => {
  return (
    <Card
      stack
      className={css({
        h: 'fit-content',
        flex: 1,
        maxW: '32rem',
        '@media screen and (max-width: 1420px)': { maxW: '47.5rem', flex: 'none' },
      })}
    >
      <Text.H4 fontWeight="semibold">Logins</Text.H4>
      <Suspense fallback={<Fallback />}>
        <Resolved appInfo={appInfo} />
      </Suspense>
    </Card>
  );
};
