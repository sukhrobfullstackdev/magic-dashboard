import { SheetClose, SheetContent } from '@components/presentation/sheet';
import { useAddContractModal } from '@components/views/gas-relayer-view';
import { type Contract } from '@components/views/gas-relayer-view/use-contracts';
import { useTransactions, type Tx } from '@components/views/gas-relayer-view/use-transactions';
import { useUpdateContract } from '@components/views/gas-relayer-view/use-update-contract';
import { AppType } from '@constants/appInfo';
import { CHAINS } from '@libs/blockchain';
import { clipboard } from '@libs/copy';
import {
  Button,
  IcoCaretLeft,
  IcoCaretRight,
  IcoCheckmark,
  IcoCopy,
  IcoDismiss,
  IcoExternalLink,
  IcoPolygonGas,
  IcoPolygonGasTestnet,
  IcoRefresh,
  Text,
  TextBox,
  TextInput,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table';
import { useToggle } from '@uidotdev/usehooks';
import { differenceInDays, differenceInYears, format, formatDistanceToNowStrict } from 'date-fns';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  appId: string;
  appType: AppType;
  contractId: string;
  setOpen: ReturnType<typeof useToggle>[1];
};

export type FormData = {
  name: string;
};

export const ROWS_PER_PAGE = 25;

export const TransactionsSheet = ({ appId, appType, contractId, setOpen }: Props) => {
  const [copied, setCopied] = useState(false);
  const queryKey = ['contract', contractId];
  const { data: contract } = useQuery<Contract>({ queryKey });
  const [, setAddContractModalOpen] = useAddContractModal();

  const { name = '', network = 'polygon', address = '' } = contract ?? {};

  const columns: ColumnDef<Tx>[] = useMemo(
    () => [
      {
        accessorKey: 'hash',
        cell({ row }) {
          return (
            <td>
              <a href={CHAINS[network].getTxURL(row.getValue('hash'))} target="_blank" rel="noopener noreferrer">
                <Button variant="text" size="sm" label={row.getValue<string>('hash')?.replace(/^(.{7})(.*)$/, '$1...')}>
                  <Button.TrailingIcon>
                    <IcoExternalLink />
                  </Button.TrailingIcon>
                </Button>
              </a>
            </td>
          );
        },
      },
      {
        accessorKey: 'timestamp',
        cell({ row }) {
          const timestamp = row.getValue<Date>('timestamp');

          let formated = formatDistanceToNowStrict(timestamp, { addSuffix: true });

          if (differenceInDays(new Date(), timestamp) > 0) {
            formated = format(timestamp, 'MM/dd HH:mm:ss');
          }

          if (differenceInYears(new Date(), timestamp) > 0) {
            formated = format(timestamp, 'MM/dd/yy HH:mm:ss');
          }

          return (
            <td className={css({ textAlign: 'right' })}>
              <Text size="sm">{formated}</Text>
            </td>
          );
        },
      },
      {
        accessorKey: 'gas',
        cell({ row }) {
          const gas = row.getValue<number>('gas');
          const gasDisplay = gas === 0 ? '0' : parseFloat(gas.toFixed(6));
          return (
            <td className={css({ textAlign: 'right' })}>
              <Text size="sm">{gasDisplay} MATIC</Text>
            </td>
          );
        },
      },
    ],
    [network],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });

  const { data, refetch, isFetching } = useTransactions({ appId, appType, contractId, ...pagination });

  const txs = data?.data;
  const pageCount = data?.pageCount;

  const table = useReactTable({
    data: txs ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    pageCount,
    state: {
      pagination,
    },
  });

  const [isEditMode, toggleEditMode] = useToggle(false);

  const {
    register,
    reset,
    formState: { errors, isDirty, isValid },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      name,
    },
  });

  useEffect(() => {
    reset({ name });
  }, [isEditMode, network, address, reset, name]);

  const { mutateAsync: update } = useUpdateContract({ appId, appType, id: contractId });

  const onSubmit = handleSubmit((submitted) => {
    update(submitted);

    toggleEditMode(false);
  });

  return (
    <SheetContent className={css({ p: 4, overflowX: 'auto' })}>
      <form onSubmit={onSubmit}>
        <HStack gap={4} justifyContent="end">
          <Button variant="text" onPress={() => toggleEditMode()} label={isEditMode ? 'Cancel' : 'Edit'} />
          {!isEditMode ? (
            <SheetClose
              type="button"
              className={css({
                cursor: 'pointer',
                rounded: 'full',
                bgColor: 'surface.tertiary',
                w: 8,
                h: 8,
              })}
            >
              <Button size="sm" variant="neutral" onPress={() => setOpen(false)}>
                <Button.LeadingIcon>
                  <IcoDismiss width={16} height={16} />
                </Button.LeadingIcon>
              </Button>
            </SheetClose>
          ) : (
            <Button size="sm" disabled={!isDirty || !isValid} label="Save" />
          )}
        </HStack>
        <Stack gap={8} px={10}>
          {network === 'polygon' ? (
            <IcoPolygonGas width={48} height={48} color="#8247E5" />
          ) : (
            <IcoPolygonGasTestnet width={48} height={48} color={token('colors.warning.base')} />
          )}
          {isEditMode ? (
            <Stack gap={6}>
              <TextInput
                label="Name"
                placeholder="Test Contract"
                {...register('name', { required: 'Name is required' })}
                onChange={(value) => register('name').onChange({ target: { name: 'name', value } })}
                errorMessage={errors.name?.message}
              />
              <HStack>
                <Text size="sm">
                  Network and contract address cannot be edited after creation. To use a different network/contract,
                  <Button
                    size="sm"
                    variant="text"
                    label="add a new contract"
                    onPress={() => {
                      setOpen(false);
                      setAddContractModalOpen(true);
                    }}
                  />
                  .
                </Text>
              </HStack>

              <Text size="sm" fontWeight="medium">
                Blockchain network
              </Text>
              <TextBox content={contract?.network ?? ''} />

              <Text size="sm" fontWeight="medium">
                Contract address
              </Text>
              <TextBox content={contract?.address ?? ''} />
            </Stack>
          ) : (
            <>
              <Stack gap={2}>
                <Text.H2>{name}</Text.H2>
                <HStack gap={1}>
                  <Text.Mono>{address.replace(/^(.{5})(.*)(.{3})$/, '$1...$3')}</Text.Mono>
                  {!copied ? (
                    <Button
                      variant="text"
                      size="sm"
                      onPress={() => {
                        clipboard.writeText(address);
                        setCopied(true);
                        setTimeout(() => {
                          setCopied(false);
                        }, 1500);
                      }}
                    >
                      <Button.LeadingIcon>
                        <IcoCopy />
                      </Button.LeadingIcon>
                    </Button>
                  ) : (
                    <IcoCheckmark width={16} height={16} />
                  )}
                  <a href={CHAINS[network].getAccountURL(address)} target="_blank" rel="noopener noreferrer">
                    <Button variant="text" size="sm">
                      <Button.LeadingIcon>
                        <IcoExternalLink />
                      </Button.LeadingIcon>
                    </Button>
                  </a>
                </HStack>
              </Stack>
              <Stack>
                <HStack justifyContent="space-between">
                  <Text.H4>Activity</Text.H4>
                  <Button
                    variant="text"
                    size="sm"
                    onPress={() => {
                      table.setPageIndex(0);
                      refetch();
                    }}
                    label="Refresh"
                  >
                    <Button.LeadingIcon>
                      <IcoRefresh />
                    </Button.LeadingIcon>
                  </Button>
                </HStack>
                <Stack gap={2}>
                  {isFetching ? (
                    <Box>
                      {[...Array(ROWS_PER_PAGE).keys()].map((row) => (
                        <Fragment key={row}>
                          <Box />
                        </Fragment>
                      ))}
                    </Box>
                  ) : table.getRowModel().rows.length > 0 ? (
                    <table>
                      <tbody>
                        {table.getRowModel().rows.map((row, idx, arr) => (
                          <tr
                            key={row.id}
                            className={css({
                              py: 3,
                              h: '48px',
                              borderBottomColor: 'surface.tertiary',
                              borderBottomWidth: idx === arr.length - 1 ? 'none' : '1px',
                            })}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <Fragment key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <Text size="sm">
                      No transactions found.{' '}
                      <a
                        href="https://magic.link/docs/nfts/features/gas-subsidy#client-side-integration"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="text" label="View Docs" />
                      </a>{' '}
                      for help getting started.
                    </Text>
                  )}
                  {table.getPageCount() > 1 && (
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
                            }}
                          />
                        </Box>
                        <Text inline fontColor="text.tertiary">
                          of {pageCount}
                        </Text>
                      </HStack>
                      <HStack>
                        <Button
                          size="sm"
                          variant="neutral"
                          disabled={!table.getCanPreviousPage()}
                          onPress={() => table.previousPage()}
                        >
                          <Button.LeadingIcon>
                            <IcoCaretLeft />
                          </Button.LeadingIcon>
                        </Button>
                        <Button
                          size="sm"
                          variant="neutral"
                          disabled={!table.getCanNextPage()}
                          onPress={() => table.nextPage}
                        >
                          <Button.LeadingIcon>
                            <IcoCaretRight />
                          </Button.LeadingIcon>
                        </Button>
                      </HStack>
                    </HStack>
                  )}
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </form>
    </SheetContent>
  );
};
