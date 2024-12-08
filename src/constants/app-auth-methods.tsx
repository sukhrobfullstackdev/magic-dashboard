import { APP_AUTH_METHOD_NAMES } from '@constants/appInfo';
import {
  IcoEmailFill,
  IcoFingerprintFill,
  IcoMessageFill,
  IcoMobile2fafill,
  WltCoinbase,
  WltMetamask,
  WltWalletConnect,
} from '@magiclabs/ui-components';

export const APP_AUTH_METHODS_METADATA = {
  [APP_AUTH_METHOD_NAMES.LINK]: {
    label: 'Email',
    icon: IcoEmailFill,
    docUrl: 'https://magic.link/docs/authentication/login/magic-links',
    dropdownMenus: {
      disable: true,
    },
  },
  [APP_AUTH_METHOD_NAMES.SMS]: {
    label: 'SMS',
    icon: IcoMessageFill,
    docUrl: 'https://magic.link/docs/authentication/login/sms-login',
    dropdownMenus: {
      disable: true,
    },
  },
  [APP_AUTH_METHOD_NAMES.WEBAUTHN]: {
    label: 'WebAuthn',
    icon: IcoFingerprintFill,
    docUrl: 'https://magic.link/docs/authentication/login/webauthn',
    dropdownMenus: {
      disable: true,
    },
  },
  [APP_AUTH_METHOD_NAMES.MFA]: {
    label: 'MFA',
    icon: IcoMobile2fafill,
    docUrl: 'https://magic.link/docs/authentication/features/mfa',
    dropdownMenus: {
      disable: false,
    },
  },
  [APP_AUTH_METHOD_NAMES.COINBASE_WALLET]: {
    label: 'Coinbase Wallet',
    icon: WltCoinbase,
    docUrl: '',
  },
  [APP_AUTH_METHOD_NAMES.METAMASK_WALLET]: {
    label: 'MetaMask',
    icon: WltMetamask,
    docUrl: '',
  },
  [APP_AUTH_METHOD_NAMES.WALLET_CONNECT]: {
    label: 'WalletConnect',
    icon: WltWalletConnect,
    docUrl: '',
  },
};
