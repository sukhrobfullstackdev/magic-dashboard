import { type HandleActiveEventParams } from '@components/views/event-logs-view/event-logs-view';
import { MAGIC_DOCS_URL } from '@constants/urls';
import { type EventLogLoginItem, type EventLogStatus } from '@custom-types/data-models/events-logs';
import { getEventTypeString, getTimeValue, isError } from '@libs/event-logs';
import { IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnDefTemplate,
  type HeaderGroup,
} from '@tanstack/react-table';
import Skeleton from 'react-loading-skeleton';

type CellProps = CellContext<EventLogLoginItem, unknown>;

type TableProps = {
  data: EventLogLoginItem[];
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  handleActiveEvent: (params: HandleActiveEventParams) => void;
};

const EventCell: ColumnDefTemplate<CellProps> = ({ row }: CellProps) => {
  const status: EventLogStatus = row.getValue('eventStatus');
  const hasError = isError(status);
  const value = getEventTypeString(status, false, row?.original.eventDetail);
  return (
    <td className={css({ pl: 4, h: '44px' })}>
      <Text size="sm" variant={hasError ? 'error' : 'text'}>
        {value}
      </Text>
    </td>
  );
};

const UserCell: ColumnDefTemplate<CellProps> = ({ row }: CellProps) => {
  const hasError = isError(row.getValue('eventStatus'));
  return (
    <td>
      <Text size="sm" variant={hasError ? 'error' : 'info'}>
        {row.getValue('userIdentifierValue')}
      </Text>
    </td>
  );
};
const TimeCell: ColumnDefTemplate<CellProps> = ({ row }: CellProps) => {
  return (
    <td>
      <Text size="sm">{getTimeValue(row.getValue('timestamp'))}</Text>
    </td>
  );
};

export const columns: ColumnDef<EventLogLoginItem>[] = [
  {
    accessorKey: 'eventStatus',
    header: () => (
      <th>
        <HStack gap={1} pl={4}>
          <Text size="sm" fontWeight="medium">
            Event
          </Text>
          <Tooltip
            content={
              <Text inline fontColor="text.tertiary" size="xs">
                To learn more about which events are logged,{' '}
                <a href={`${MAGIC_DOCS_URL}/authentication/features/event-logs`} target="_blank" rel="noreferrer">
                  read on Docs
                </a>
              </Text>
            }
          >
            <IcoQuestionCircleFill color={token('colors.neutral.primary')} height="0.75rem" width="0.75rem" />
          </Tooltip>
        </HStack>
      </th>
    ),
    cell: EventCell,
  },
  {
    accessorKey: 'userIdentifierValue',
    header: () => (
      <th>
        <Text size="sm" fontWeight="medium" styles={{ textAlign: 'left' }}>
          User
        </Text>
      </th>
    ),
    cell: UserCell,
  },
  {
    accessorKey: 'timestamp',
    header: () => (
      <th>
        <Text size="sm" fontWeight="medium" styles={{ textAlign: 'left' }}>
          Time
        </Text>
      </th>
    ),
    cell: TimeCell,
  },
];

export const LoginEventsTable = ({ data = [], isFetching, isFetchingNextPage, handleActiveEvent }: TableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const isFullFetching = isFetching && !isFetchingNextPage;

  return (
    <Stack overflowY="auto" h="calc(100vh - 520px)" scrollbarWidth="thin">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<EventLogLoginItem>) => (
            <tr className={css({ h: '48px', py: 3 })} key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, {
                      key: header.id,
                      ...header.getContext(),
                    });
              })}
            </tr>
          ))}
        </thead>
        {!isFullFetching && (
          <tbody
            className={css({
              mt: 3,
            })}
          >
            {rows.map((row, idx, arr) => (
              <tr
                className={css({
                  borderBottomWidth: idx === arr.length - 1 ? 'none' : '1px',
                  borderBottomColor: 'surface.tertiary',
                  cursor: 'pointer',
                  py: 3,
                })}
                onClick={() =>
                  handleActiveEvent({
                    groupId: row?.original.groupId || null,
                    meta: row.original,
                  })
                }
                key={row?.id}
              >
                {row?.getVisibleCells().map((cell) => flexRender(cell.column.columnDef.cell, cell.getContext()))}
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {(isFetching || isFetchingNextPage) &&
        [...Array(10).keys()].map((row: number) => (
          <Box key={row}>
            <Skeleton />
          </Box>
        ))}
    </Stack>
  );
};
