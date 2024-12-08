import { type PaginationState } from '@tanstack/react-table';
import { http } from 'viem';
import { polygon } from 'viem/chains';

export type NETWORK = 'polygon' | 'amoy' | 'ghostnet';

// defineChain unfortunately is not exportable.
export const polygonAmoy = {
  id: 80_002,
  name: 'Polygon Amoy',
  network: 'amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OK LINK',
      url: 'https://www.oklink.com/amoy',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3127388,
    },
  },
  testnet: true,
};

export const ghostnet = {
  id: 128_123,
  name: 'Etherlink Testnet',
  network: 'ghost',
  nativeCurrency: { name: 'XTZ', symbol: 'XTZ', decimals: 18 },
  rpcUrls: {
    public: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
    default: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink testnet',
      url: 'https://testnet-explorer.etherlink.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3127388,
    },
  },
  testnet: true,
};

export const CHAINS = {
  polygon: {
    chain: polygon,
    transport: http('https://polygon-mainnet.g.alchemy.com/v2/FXBozVMsvNJl8132xpIlTz8k5IK7Rklk'),
    scanURL: 'https://polygonscan.com',
    getTxURL: (hash: string) => `https://polygonscan.com/tx/${hash}`,
    getTxsURL: ({ address, pageIndex, pageSize }: TxsParams) =>
      `https://polygonscan.com/txs?${new URLSearchParams({ a: address, p: `${pageIndex + 1}`, ps: `${pageSize}` })}`,
    getAccountURL: (address: string) => `https://polygonscan.com/address/${address}`,
  },
  amoy: {
    chain: polygonAmoy,
    transport: http('https://polygon-amoy.g.alchemy.com/v2/1D6XDLjXPWIj_rf4dPgdM9M_QgqTtPGa'),
    scanURL: 'https://www.oklink.com/amoy',
    getTxURL: (hash: string) => `https://www.oklink.com/amoy/tx/${hash}`,
    getTxsURL: ({ address, pageIndex, pageSize }: TxsParams) =>
      `https://www.oklink.com/amoy/txs?${new URLSearchParams({
        a: address,
        p: `${pageIndex + 1}`,
        ps: `${pageSize}`,
      })}`,
    getAccountURL: (address: string) => `https://www.oklink.com/amoy/address/${address}`,
  },
  ghostnet: {
    chain: ghostnet,
    transport: http('https://node.ghostnet.etherlink.com'),
    scanURL: 'https://testnet-explorer.etherlink.com',
    getTxURL: (hash: string) => `https://testnet-explorer.etherlink.com/tx/${hash}`,
    getTxsURL: ({ address, pageIndex, pageSize }: TxsParams) =>
      `https://testnet-explorer.etherlink.com/txs${new URLSearchParams({
        a: address,
        p: `${pageIndex + 1}`,
        ps: `${pageSize}`,
      })}`,
    getAccountURL: (address: string) => `https://testnet-explorer.etherlink.com/address/${address}`,
  },
} as const;

export const getNetworkFromChainId = (chainId: number) => {
  if (chainId === polygon.id) return 'polygon';
  if (chainId === polygonAmoy.id) return 'amoy';
  if (chainId === ghostnet.id) return 'ghostnet';
  throw new Error(`Unknown chainId ${chainId}`);
};

type TxsParams = {
  address: string;
} & PaginationState;
