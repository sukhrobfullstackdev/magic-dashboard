import { IcoAtom, IcoGlobe, IconDedicated, IconPassport } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

export const CONNECT_APP = 'connect';
export const AUTH_APP = 'auth';
export const PASSPORT_APP = 'passport';
export const EMBEDDED_APP = 'embedded';

export const DEFAULT_APP_LOGO_SRC = '/images/mg_icons/default_app_logo.svg';

export type AppType = typeof CONNECT_APP | typeof AUTH_APP | typeof PASSPORT_APP | typeof EMBEDDED_APP;

export const CONNECT_APP_DISABLED_DATE = new Date('2024-02-07T18:30:00.000Z');

export const APP_LABEL = {
  [AUTH_APP]: {
    short: 'Dedicated',
    long: 'Dedicated Wallet',
    Logo: IcoAtom,
    color: token('colors.dedicated.base'),
    bgColor: token('colors.dedicated.lightest'),
  },
  [CONNECT_APP]: {
    short: 'Universal',
    long: 'Universal Wallet',
    Logo: IcoGlobe,
    color: token('colors.brand.darker'),
    bgColor: '#edebff',
  },
  [PASSPORT_APP]: {
    short: 'Passport',
    long: 'Passport Wallet',
    Logo: IconPassport,
    color: '#2267f0',
    bgColor: '#3826B2',
  },
  [EMBEDDED_APP]: {
    short: 'Dedicated',
    long: 'Dedicated Wallet',
    Logo: IconDedicated,
    color: '#522fd4',
    bgColor: '#F09BEB',
  },
};

export const APP_AUTH_METHOD_NAMES = {
  LINK: 'link',
  SMS: 'sms',
  WEBAUTHN: 'webauthn',
  MFA: 'mfa',
  WALLET_CONNECT: 'wallet_connect',
  COINBASE_WALLET: 'coinbase_wallet',
  METAMASK_WALLET: 'metamask_wallet',
} as const;
