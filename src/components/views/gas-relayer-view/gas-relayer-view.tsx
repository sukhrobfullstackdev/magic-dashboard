'use client';

import { useSharedState } from '@components/hooks/use-shared-state';
import { Sheet, SheetTrigger } from '@components/presentation/sheet';
import { AddContractModal, NETWORK_OPTIONS } from '@components/views/gas-relayer-view/add-contract-modal';
import { QuickStartCard } from '@components/views/gas-relayer-view/quickstart-card';
import { TransactionsSheet } from '@components/views/gas-relayer-view/transactions-sheet';
import { useContracts, type Contract } from '@components/views/gas-relayer-view/use-contracts';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import { CHAINS, type NETWORK } from '@libs/blockchain';
import { clipboard } from '@libs/copy';
import {
  Button,
  Card,
  IcoArrowDown,
  IcoArrowRight,
  IcoCaretLeft,
  IcoCaretRight,
  IcoCheckmark,
  IcoCopy,
  IcoDiamond,
  IcoExternalLink,
  IcoQuestionCircleFill,
  LogoPolygon,
  Text,
  TextInput,
  Tooltip,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { IconArrowUp } from '@tabler/icons-react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnDefTemplate,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useToggle } from '@uidotdev/usehooks';
import { format } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import { polygon } from 'viem/chains';

export const useAddContractModal = () => {
  return useSharedState(['addContractModal'], false);
};

type CellProps = CellContext<Contract, unknown>;

const NameCell: ColumnDefTemplate<CellProps> = ({ row }: CellProps) => {
  const [open, setOpen] = useToggle(false);
  const { currentApp } = useCurrentApp();

  return (
    <td style={{ minWidth: '200px' }}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Box>
            <Button
              variant="text"
              size="sm"
              onPress={(e) => {
                setOpen(true);
                e.continuePropagation();
              }}
              label={row.getValue('name')}
            />
          </Box>
        </SheetTrigger>
        {currentApp && (
          <TransactionsSheet
            appId={currentApp.appId}
            appType={currentApp.appType}
            contractId={row.getValue('id')}
            setOpen={setOpen}
          />
        )}
      </Sheet>
    </td>
  );
};

const AddressCell: ColumnDefTemplate<CellProps> = ({ row }: CellProps) => {
  const [copied, setCopied] = useState(false);

  const address = row.getValue<string>('address');
  const network = row.getValue<NETWORK>('network');

  return (
    <td>
      <HStack>
        <Text.Mono size="sm">{address.replace(/^(.{5})(.*)(.{4})$/, '$1...$3')}</Text.Mono>
        {!copied ? (
          <Box cursor="pointer">
            <IcoCopy
              width={16}
              height={16}
              onClick={() => {
                clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
          </Box>
        ) : (
          <IcoCheckmark width={16} height={16} />
        )}
        <a href={CHAINS[network].getAccountURL(address)} target="_blank" rel="noopener noreferrer">
          <IcoExternalLink width={16} height={16} color={token('colors.brand.base')} />
        </a>
      </HStack>
    </td>
  );
};

const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: 'id',
    header() {
      return <th hidden>ID</th>;
    },
    cell({ row }) {
      return <td hidden>{row.getValue('id')}</td>;
    },
  },
  {
    accessorKey: 'name',
    sortingFn: 'alphanumericCaseSensitive',
    header({ column }) {
      return (
        <th className={css({ minW: '200px', textAlign: 'left' })}>
          <Button
            label="Name"
            variant="text"
            size="sm"
            textStyle={column.getIsSorted() ? undefined : 'neutral'}
            onPress={() => column.toggleSorting()}
          >
            {column.getIsSorted() && (
              <Button.TrailingIcon>
                {column.getIsSorted() === 'asc' ? <IconArrowUp /> : <IcoArrowDown />}
              </Button.TrailingIcon>
            )}
          </Button>
        </th>
      );
    },
    cell: NameCell,
  },
  {
    accessorKey: 'network',
    sortingFn: 'alphanumericCaseSensitive',
    header({ column }) {
      return (
        <th className={css({ textAlign: 'left' })}>
          <Button
            label="Network"
            variant="text"
            size="sm"
            textStyle={column.getIsSorted() ? undefined : 'neutral'}
            onPress={() => column.toggleSorting()}
          >
            {column.getIsSorted() && (
              <Button.TrailingIcon>
                {column.getIsSorted() === 'asc' ? <IconArrowUp /> : <IcoArrowDown />}
              </Button.TrailingIcon>
            )}
          </Button>
        </th>
      );
    },
    cell({ row }) {
      return (
        <td>
          <Text size="sm">{NETWORK_OPTIONS.find((o) => o.value === row.getValue('network'))?.label}</Text>
        </td>
      );
    },
  },
  {
    accessorKey: 'address',
    header() {
      return (
        <th className={css({ textAlign: 'left' })}>
          <Text size="sm" fontWeight="semibold">
            Address
          </Text>
        </th>
      );
    },
    cell: AddressCell,
  },
  {
    accessorKey: 'totalGas',
    sortingFn: 'alphanumericCaseSensitive',
    sortDescFirst: false,
    header({ column }) {
      return (
        <th className={css({ minW: '150px', textAlign: 'right' })}>
          <Button
            label="Total Gas"
            variant="text"
            size="sm"
            textStyle={column.getIsSorted() ? undefined : 'neutral'}
            onPress={() => column.toggleSorting()}
          >
            {column.getIsSorted() && (
              <Button.TrailingIcon>
                {column.getIsSorted() === 'asc' ? <IconArrowUp /> : <IcoArrowDown />}
              </Button.TrailingIcon>
            )}
          </Button>
        </th>
      );
    },
    cell({ row }) {
      const gas = row.getValue<number>('totalGas');
      const gasDisplay = gas === 0 ? '0' : parseFloat(gas.toFixed(6));
      return (
        <td className={css({ minW: '150px', textAlign: 'right' })}>
          <Text size="sm">{gasDisplay} MATIC</Text>
        </td>
      );
    },
  },
];

const Resolved = ({ app }: { app: App }) => {
  const [open, setOpen] = useAddContractModal();
  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );
  const isGasRelayerEnabled = appInfo.featureFlags.is_gasless_transactions_enabled;

  const { data } = useContracts({
    appId: app.appId,
    appType: app.appType,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearchParams = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
  const page = searchParams?.get('page') ? parseInt(searchParams?.get('page') ?? '') : 1;
  const ROWS_PER_PAGE = 10;
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: ROWS_PER_PAGE,
  });

  const gasSpent = data?.gasSpent[polygon.id] ?? 0;

  const table = useReactTable({
    data: data?.contracts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
  });

  const hasData = Boolean(data?.contracts.length);

  return (
    <Stack p={6} gap={6}>
      <Stack gap={2}>
        <Text.H3>Gas Subsidy</Text.H3>
        <Text>Provide a seamless UX by eliminating gas fees for your users</Text>
      </Stack>
      <QuickStartCard />
      {hasData ? (
        <Card className={css({ p: '24px 32px', overflow: 'visible' })}>
          <HStack gap={2}>
            <Text.H4>{format(new Date(), 'MMMM')} Gas Use</Text.H4>
            <Text.H4 fontColor="text.tertiary">(Mainnet)</Text.H4>
            <Tooltip
              content={
                <Text inline size="sm" fontColor="text.tertiary">
                  Total gas fees paid on behalf of users across all mainnet smart contracts this month
                </Text>
              }
            >
              <IcoQuestionCircleFill width={16} height={16} color={token('colors.neutral.primary')} />
            </Tooltip>
            <Box flexGrow={1} />
            <Text.H4 fontWeight="medium">{gasSpent === 0 ? '0' : parseFloat(gasSpent.toFixed(6))} MATIC</Text.H4>
            <LogoPolygon />
          </HStack>
        </Card>
      ) : null}

      <Card>
        <Stack>
          <HStack>
            <Stack gap={2}>
              <Text.H3>Smart Contracts</Text.H3>
              <Text fontColor="text.tertiary">Register a verified smart contract to offer gas-less transactions</Text>
            </Stack>
            <Box flexGrow={1} />
            <HStack gap={4}>
              <Button size="sm" label="Add contract" disabled={!isGasRelayerEnabled} onPress={() => setOpen(true)} />
            </HStack>
          </HStack>
          {!isGasRelayerEnabled ? (
            <Box mt={8}>
              <a href="https://magic.link/contact" target="_blank" rel="noopener noreferrer">
                <HStack bg="linear-gradient(180deg, #6851ff 0%, #518cff 100%)" p="12px 16px" borderRadius="8px">
                  <IcoDiamond color={token('colors.surface.primary')} />
                  <Text styles={{ color: token('colors.chalk') }}>
                    <b>Contact us</b> for access to this premium feature
                  </Text>
                  <Box flexGrow={1} />
                  <IcoArrowRight color={token('colors.surface.primary')} />
                </HStack>
              </a>
            </Box>
          ) : (
            <>
              {hasData && (
                <table>
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr className={css({ padding: '12px 0px' })} key={headerGroup.id}>
                        {headerGroup.headers.map((header) =>
                          header.isPlaceholder ? null : (
                            <Fragment key={header.id}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Fragment>
                          ),
                        )}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, idx, arr) => (
                      <tr
                        className={css({
                          h: '48px',
                          padding: '12px 0px',
                          borderBottomColor: 'surface.tertiary',
                          borderBottomWidth: idx === arr.length - 1 ? 'none' : '1px',
                        })}
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <Fragment key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {table.getPageCount() > 0 && (
                <footer>
                  <HStack justifyContent="space-between">
                    <HStack gap={4}>
                      <Text inline fontColor="text.tertiary">
                        Page
                      </Text>
                      <Box w={10}>
                        <TextInput
                          value={`${pagination.pageIndex + 1}`}
                          aria-label="page input"
                          onChange={(text) => {
                            if (!text) return;
                            setPagination((p) => ({ ...p, pageIndex: parseInt(text) - 1 }));
                            urlSearchParams.set('page', `${parseInt(text)}`);
                            router.push(`${pathname}?${urlSearchParams.toString()}`);
                          }}
                        />
                      </Box>
                      <Text inline fontColor="text.tertiary">
                        of {table.getPageCount()}
                      </Text>
                    </HStack>
                    <HStack>
                      <Button
                        size="sm"
                        variant="neutral"
                        disabled={!table.getCanPreviousPage()}
                        onPress={() => {
                          setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }));
                          urlSearchParams.set('page', `${page - 1}`);
                          router.push(`${pathname}?${urlSearchParams.toString()}`);
                        }}
                      >
                        <Button.LeadingIcon>
                          <IcoCaretLeft />
                        </Button.LeadingIcon>
                      </Button>
                      <Button
                        size="sm"
                        variant="neutral"
                        disabled={!table.getCanNextPage()}
                        onPress={() => {
                          setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }));
                          urlSearchParams.set('page', `${page + 1}`);
                          router.push(`${pathname}?${urlSearchParams.toString()}`);
                        }}
                      >
                        <Button.LeadingIcon>
                          <IcoCaretRight />
                        </Button.LeadingIcon>
                      </Button>
                    </HStack>
                  </HStack>
                </footer>
              )}
            </>
          )}
        </Stack>
      </Card>
      <AddContractModal open={open} close={() => setOpen(false)} app={app} />
    </Stack>
  );
};

export const GasSubsidyView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
