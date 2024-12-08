import { getDisplayUserId } from '@components/partials/end-user-info-row/end-user-info-row';
import { IconProvenance } from '@components/presentation/icon/icon-provenance';
import { useDisableMfaModal } from '@components/views/users-view/disable-mfa-modal';
import { MfaDropdown } from '@components/views/users-view/mfa-dropdown';
import Table from '@components/views/users-view/table';
import { type SignupAppUser } from '@hooks/data/app-users/types';
import { formatToDateWithTimestamp } from '@libs/date';
import { Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { type QueryKey } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect } from 'react';

const columnHelper = createColumnHelper<SignupAppUser>();

const columns = [
  columnHelper.accessor('provenance', {
    header: () => (
      <Text size="sm" fontColor="text.tertiary">
        Login
      </Text>
    ),
    cell: (info) => <IconProvenance provenance={info.getValue()} />,
  }),
  columnHelper.accessor('userId', {
    header: () => '',
    cell: (info) => (
      <Box minW="12.5rem">
        <Text truncate fontColor="text.tertiary">
          {getDisplayUserId(
            {
              id: info.row.original.userId,
              provenance: info.row.original.provenance,
            },
            true,
          )}
        </Text>
      </Box>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: () => (
      <Text size="sm" fontColor="text.tertiary">
        Signed Up
      </Text>
    ),
    cell: (info) => (
      <Box minW="11.25rem">
        <Text fontColor="text.tertiary">{formatToDateWithTimestamp(info.getValue())}</Text>
      </Box>
    ),
  }),
  columnHelper.accessor('isMfaEnabled', {
    header: () => (
      <Text size="sm" fontColor="text.tertiary">
        MFA
      </Text>
    ),
    cell: (info) => (
      <MfaDropdown
        enabled={info.row.original.isMfaEnabled}
        userId={info.row.original.userId}
        authUserId={info.row.original.authUserId}
      />
    ),
  }),
];

type Props = {
  queryKey: QueryKey;
  data: SignupAppUser[];
};

export const DedicatedTable = ({ data, queryKey }: Props) => {
  const setQueryKey = useDisableMfaModal((state) => state.setQueryKey);

  useEffect(() => {
    setQueryKey(queryKey);
  }, [queryKey, setQueryKey]);

  return <Table data={data} columns={columns as ColumnDef<SignupAppUser, unknown>[]} />;
};
