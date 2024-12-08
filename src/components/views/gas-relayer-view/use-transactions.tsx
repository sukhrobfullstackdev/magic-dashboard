import { client } from '@components/contexts/query-provider';
import { ROWS_PER_PAGE } from '@components/views/gas-relayer-view/transactions-sheet';
import { type Contract } from '@components/views/gas-relayer-view/use-contracts';
import { ENV } from '@config';
import { AppType } from '@constants/appInfo';
import { GAS_API_ENDPOINTS } from '@constants/endpoints';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { useQuery } from '@tanstack/react-query';
import { type PaginationState } from '@tanstack/react-table';
import { type Hash } from 'viem';

type Props = {
  appId: string;
  appType: AppType;
  contractId: string;
} & PaginationState;

export const useTransactions = (params: Props) => {
  const { contractId, ...pagination } = params;
  const queryKey = ['contract', contractId];
  const { data: contract } = useQuery<Contract>({ queryKey });

  const address = contract?.address;

  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({ appId: params.appId, appType: params.appType }),
  );

  const { data: queryData, ...rest } = useQuery({
    queryKey: ['txs', address, pagination],
    queryFn: async () => {
      const data = await fetch(
        `${GAS_API_ENDPOINTS[ENV]}/v1/dashboard/get-transactions?${new URLSearchParams({
          contract_id: contractId,
          limit: `${pagination.pageSize}`,
          offset: `${pagination.pageIndex * pagination.pageSize}`,
        })}`,
        { headers: { 'X-Magic-Secret-Key': appInfo.liveSecretKey } },
      ).then<Response>((r) => r.json());

      const pageCount = Math.ceil(data.total_transaction_count / ROWS_PER_PAGE);

      return {
        data: data.transactions.map(
          ({ gas_spent, tx_hash, time_created }) =>
            ({
              hash: tx_hash,
              timestamp: new Date(time_created),
              gas: gas_spent != null ? gas_spent : 0,
            }) as Tx,
        ),
        pageCount,
      };
    },
    placeholderData: (prev) => prev,
    staleTime: Infinity,
  });

  const refetch = () => {
    client.refetchQueries({ queryKey: ['txs', address] });
  };

  return {
    data: queryData,
    ...rest,
    refetch,
  };
};

export type Tx = {
  hash: Hash;
  timestamp: Date;
  gas: number;
};
// Generated by https://quicktype.io

interface Response {
  offset: number;
  total_transaction_count: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  gas_spent: number;
  tx_hash: string;
  state: string;
  time_created: string;
}