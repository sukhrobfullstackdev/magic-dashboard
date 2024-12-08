import { getDisplayUserId } from '@components/partials/end-user-info-row/end-user-info-row';
import Table from '@components/views/users-view/table';
import { type SignupAppUser } from '@hooks/data/app-users/types';
import { formatDateInUtc } from '@libs/date';
import { IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<SignupAppUser>();

const HeaderContent = ({ title, tooltip }: { title: string; tooltip: string }) => {
  return (
    <HStack gap={1.5}>
      <Text size="sm" fontWeight="medium" fontColor="text.tertiary">
        {title}
      </Text>
      <Tooltip
        content={
          <Text inline fontColor="text.tertiary" size="xs">
            {tooltip}
          </Text>
        }
      >
        <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={14} height={14} />
      </Tooltip>
    </HStack>
  );
};

// TODO: update accessors once backend data is finished
const columns = [
  columnHelper.accessor('authUserId', {
    header: () => (
      <HeaderContent
        title="Email Address"
        tooltip="The email address associated with the user’s wallet. If no email is displayed, the user signed in using an external wallet."
      />
    ),
    cell: (info) => (
      <Box minW="16rem" mr={4}>
        <Text truncate size="sm" fontWeight="medium">
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
  columnHelper.accessor('userId', {
    header: () => (
      <HeaderContent
        title="Passport Address"
        tooltip="The wallet address a user created when first interacted with your passport app."
      />
    ),
    cell: (info) => (
      <Box minW="12.5rem" mr={4}>
        <Text truncate size="sm">
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
      <HeaderContent
        title="First Connected"
        tooltip="The date and time a user first interacted with your passport app."
      />
    ),
    cell: (info) => (
      <Box minW="11.25rem" mr={4}>
        <Text size="sm">{formatDateInUtc(info.getValue())}</Text>
      </Box>
    ),
  }),
  columnHelper.accessor('loggedInAt', {
    header: () => (
      <HeaderContent
        title="Last Connected"
        tooltip="The date and time a user last interacted with your passport app."
      />
    ),
    cell: (info) => (
      <Box minW="11.25rem">
        <Text size="sm">{formatDateInUtc(info.getValue())}</Text>
      </Box>
    ),
  }),
];

type Props = {
  data: SignupAppUser[];
};

export const PassportTable = ({ data }: Props) => {
  return <Table data={data} columns={columns as ColumnDef<SignupAppUser, unknown>[]} />;
};
