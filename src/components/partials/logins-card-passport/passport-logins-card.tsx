import { useAppConnectionsSuspenseQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { AppInfo } from '@hooks/data/app/types';
import { formatToDateWithTimestamp, parseToDate } from '@libs/date';
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
    <Stack gap={3}>
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
  const { data: appConnections } = useAppConnectionsSuspenseQuery(appUsersQueryKey.connections({ appId }));
  const limitedConnections = appConnections.slice(0, 14);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  return (
    <Stack gap={3}>
      {limitedConnections.length === 0 ? (
        <Text size="sm" fontColor="text.tertiary">
          No one connected to <span className={css({ fontWeight: 'semibold' })}>{appName}</span> yet!
        </Text>
      ) : (
        <>
          {limitedConnections.map((connection) => (
            <HStack key={connection.connectedAt + connection.publicAddress} justifyContent="space-between">
              <Text size="sm">{truncateAddress(connection.publicAddress)}</Text>
              <Text size="sm" fontColor="text.tertiary">
                {formatToDateWithTimestamp(parseToDate(connection.connectedAt))}
              </Text>
            </HStack>
          ))}
        </>
      )}
    </Stack>
  );
};

export const PassportLoginsCard = ({ appInfo }: Props) => {
  return (
    <Card
      stack
      className={css({
        flex: 1,
        h: 'fit-content',
        maxW: '23rem',
        '@media screen and (max-width: 1420px)': { maxW: '47.5rem', flex: 'none' },
      })}
    >
      <Text.H4 fontWeight="semibold">Wallet Connections</Text.H4>
      <Suspense fallback={<Fallback />}>
        <Resolved appInfo={appInfo} />
      </Suspense>
    </Card>
  );
};
