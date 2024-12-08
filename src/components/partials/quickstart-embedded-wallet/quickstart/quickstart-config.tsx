import { type AppType } from '@constants/appInfo';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { IcoCheckmark, Text } from '@magiclabs/ui-components';
import { Circle } from '@styled/jsx';
import { token } from '@styled/tokens';

export const renderRowIcon = (number: number, complete: boolean) =>
  complete ? (
    <Circle w={6} h={6} bg="positive.lightest">
      <IcoCheckmark width={14} height={14} color={token('colors.positive.darkest')} />
    </Circle>
  ) : (
    <Circle w={6} h={6} bg="neutral.primary">
      <Text size="xs" fontColor="text.quaternary" fontWeight="bold">
        {number}
      </Text>
    </Circle>
  );

const authMethodValueMap: Record<string, string> = {
  link: 'EmailOTP',
  sms: 'SMSOTP',
};

const networkCliValueMap: Record<string, string> = {
  'Ethereum (Mainnet)': 'ethereum',
  'Ethereum (Testnet)': 'ethereum-sepolia',
  'Polygon (Mainnet)': 'polygon',
  'Polygon (Testnet)': 'polygon-amoy',
  'Etherlink (Testnet)': 'etherlink-ghostnet',
  'Flow (Mainnet)': 'flow-mainnet',
  'Flow (Testnet)': 'flow-testnet',
  'Solana (Mainnet)': 'solana-mainnet',
  'Solana (Testnet)': 'solana-testnet',
} as const;

export const getCLIInitCode = (wallet: AppType, liveApiKey: string, network: string, authMethods?: string[] | null) => {
  const networkValue = networkCliValueMap[network] ?? '';
  const authMethodFlag = authMethods
    ?.filter((am: string) => Boolean(authMethodValueMap[am])) // filter out non-supported auth-methods
    .map((am: string) => `--login-methods ${authMethodValueMap[am]}`)
    .join(' ');
  const template = `nextjs-${networkValue.includes('flow') ? 'flow-' : ''}${networkValue.includes('solana') ? 'solana-' : ''}${isDedicatedApp(wallet) ? 'dedicated-' : 'universal-'}wallet`;

  return `npx make-scoped-magic-app \\
    --template ${template} \\
    --network ${networkValue} \\
    --publishable-api-key ${liveApiKey} ${authMethodFlag ? '\\' : ''}
    ${authMethodFlag ? authMethodFlag : ''}`;
};

export const getSendYourFirstTransactionCode = (
  liveApiKey: string,
  appType: AppType,
  appendCustomNodeOptions: boolean,
) => `import { Magic } from 'magic-sdk';
import Web3 from 'web3';

${
  appendCustomNodeOptions
    ? `const magic = new Magic('${liveApiKey}', {
  network: customNodeOptions
});`
    : `const magic = new Magic('${liveApiKey}');`
}
${
  appType === 'auth'
    ? `const web3 = new Web3(magic.rpcProvider);
const accounts = await magic.wallet.connectWithUI();`
    : ''
}${
  appType === 'connect'
    ? `const magicProvider = await magic.wallet.getProvider();
const web3 = new Web3(magicProvider);
const accounts = await magic.wallet.connectWithUI();`
    : ''
}

// ⭐️ After user is successfully authenticated
const destination = '0x777ED066eB783d02C7421eB6221e9eB3fBB15501';
const amount = 10000000000000000; // 0.1 eth in wei

// Submit transaction to the blockchain
const tx = web3.eth.sendTransaction({
  from: accounts[0],
  to: destination,
  value: amount,
});

// Wait for transaction to be mined
const receipt = await tx;`;

export const getInitializeMagicAtLoginCode = (liveApiKey: string, blockChainSelect: string, appType: AppType) => {
  const network = 'customNodeOptions';
  const customNodeOptions = `
const customNodeOptions = {
  rpcUrl: YOUR_CUSTOM_EVM_RPC_URL, // Custom RPC URL
  chainId: YOUR_CUSTOM_EVM_CHAIN_ID, // Custom chain id
}`;

  return `import { Magic } from 'magic-sdk';
${customNodeOptions}
const magic = new Magic("${liveApiKey}", {
  network: ${network}
});

${
  appType === 'auth'
    ? `/* Connect to any email input or enter your own */
await magic.auth.loginWithEmailOTP({ email: "your-email" });`
    : ''
}${appType === 'connect' ? 'const accounts = await magic.wallet.connectWithUI();' : ''}`;
};

export enum QuickstartTypes {
  CLI,
  EVM,
  OTHER,
}

interface QuickStartType {
  doc?: string;
  quickstart: QuickstartTypes;
}

export const BLOCKCHAINS: Record<string, QuickStartType> = {
  'Ethereum (Mainnet)': { quickstart: QuickstartTypes.CLI },
  'Ethereum (Testnet)': { quickstart: QuickstartTypes.CLI },
  'Etherlink (Testnet)': { quickstart: QuickstartTypes.CLI },
  'Polygon (Mainnet)': { quickstart: QuickstartTypes.CLI },
  'Polygon (Testnet)': { quickstart: QuickstartTypes.CLI },
  'Solana (Mainnet)': { quickstart: QuickstartTypes.CLI },
  'Solana (Testnet)': { quickstart: QuickstartTypes.CLI },
  'Flow (Mainnet)': { quickstart: QuickstartTypes.CLI },
  'Flow (Testnet)': { quickstart: QuickstartTypes.CLI },
  Arbitrum: {
    doc: 'https://magic.link/docs/dedicated/blockchains/arbitrum',
    quickstart: QuickstartTypes.EVM,
  },
  zkSync: {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/zksync',
    quickstart: QuickstartTypes.EVM,
  },
  Binance: {
    doc: 'https://magic.link/docs/dedicated/blockchains/binance',
    quickstart: QuickstartTypes.EVM,
  },
  Cronos: {
    doc: 'https://magic.link/docs/dedicated/blockchains/cronos',
    quickstart: QuickstartTypes.EVM,
  },
  Fantom: {
    doc: 'https://magic.link/docs/dedicated/blockchains/fantom',
    quickstart: QuickstartTypes.EVM,
  },
  Moonbeam: {
    doc: 'https://magic.link/docs/dedicated/blockchains/moonbeam',
    quickstart: QuickstartTypes.EVM,
  },
  Optimism: {
    doc: 'https://magic.link/docs/dedicated/blockchains/optimism',
    quickstart: QuickstartTypes.EVM,
  },
  Algorand: {
    doc: 'https://magic.link/docs/dedicated/blockchains/algorand',
    quickstart: QuickstartTypes.OTHER,
  },
  Aptos: {
    doc: 'https://magic.link/docs/dedicated/blockchains/aptos',
    quickstart: QuickstartTypes.OTHER,
  },
  Avalanche: {
    doc: 'https://magic.link/docs/dedicated/blockchains/avalanche',
    quickstart: QuickstartTypes.OTHER,
  },
  Bitcoin: {
    doc: 'https://magic.link/docs/dedicated/blockchains/bitcoin',
    quickstart: QuickstartTypes.OTHER,
  },
  Cosmos: {
    doc: 'https://magic.link/docs/dedicated/blockchains/cosmos',
    quickstart: QuickstartTypes.OTHER,
  },
  Hedera: {
    doc: 'https://magic.link/docs/dedicated/blockchains/hedera',
    quickstart: QuickstartTypes.OTHER,
  },
  Near: {
    doc: 'https://magic.link/docs/dedicated/blockchains/near',
    quickstart: QuickstartTypes.OTHER,
  },
  Polkadot: {
    doc: 'https://magic.link/docs/dedicated/blockchains/polkadot',
    quickstart: QuickstartTypes.OTHER,
  },
  Tezos: {
    doc: 'https://magic.link/docs/dedicated/blockchains/tezos/taquito',
    quickstart: QuickstartTypes.OTHER,
  },
  Zilliqa: {
    doc: 'https://magic.link/docs/dedicated/blockchains/zilliqa',
    quickstart: QuickstartTypes.OTHER,
  },
  Loopring: {
    doc: 'https://magic.link/docs/dedicated/blockchains/loopring',
    quickstart: QuickstartTypes.OTHER,
  },
  Berachain: {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/berachain',
    quickstart: QuickstartTypes.EVM,
  },
  'Astar zkEVM': {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/astar-zkevm',
    quickstart: QuickstartTypes.EVM,
  },
  'RARI Chain': {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/rari-chain',
    quickstart: QuickstartTypes.EVM,
  },
  Flare: {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/flare',
    quickstart: QuickstartTypes.EVM,
  },
  'Horizen EON': {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/horizen-eon',
    quickstart: QuickstartTypes.EVM,
  },
  'XDC Network': {
    doc: 'https://magic.link/docs/blockchains/other-chains/evm/xdc-network',
    quickstart: QuickstartTypes.EVM,
  },
  Other: {
    doc: 'https://magic.link/docs/dedicated/overview',
    quickstart: QuickstartTypes.OTHER,
  },
};

export const BLOCKCHAIN_AUTH_SELECT_OPTIONS = Object.keys(BLOCKCHAINS);

export const BLOCKCHAIN_CONNECT_SELECT_OPTIONS = [
  'Ethereum (Mainnet)',
  'Ethereum (Testnet)',
  'Polygon (Mainnet)',
  'Polygon (Testnet)',
  'Flow (Mainnet)',
  'Flow (Testnet)',
  'Optimism',
  'Other',
];

export const QUICKSTART_LINKS = {
  DOCUMENTATION: {
    auth: 'https://magic.link/posts/hello-world',
    connect: 'https://magic.link/docs/connect/getting-started/quickstart',
    passport: '',
    embedded: '',
  },
  CODESANDBOX: {
    auth: 'https://codesandbox.io/s/t5nxnl',
    connect: 'https://codesandbox.io/s/github/magiclabs/magic-demo-react-web3',
    passport: '',
    embedded: '',
  },

  DOCS_OVERVIEW: {
    auth: 'https://magic.link/docs/auth/overview/',
    connect: 'https://magic.link/docs/connect/overview/',
    passport: '',
    embedded: '',
  },
  DOCS_CLI_DEMO: {
    auth: 'https://magic.link/docs/home/quickstart/cli',
    connect: 'https://magic.link/docs/home/quickstart/cli',
    passport: '',
    embedded: '',
  },
  HELP_CENTER: {
    auth: 'https://help.magic.link/knowledge/',
    connect: 'https://help.magic.link/knowledge/',
    passport: '',
    embedded: '',
  },
  CONTACT_SALES: {
    auth: 'https://magic.link/wallet-services#book-demo',
    connect: '',
    passport: '',
    embedded: '',
  },
};
