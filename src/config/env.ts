/*
  Here we extrapolate our ENV variables to determine which environment
  (production/development/etc.) we are currently executing in. We also provide
  a helpful enum of ENV types to make consistent ENV assertions throughout the
  code.
 */

export const ENVType = {
  Prod: 'prod',
  Dev: 'dev',
  Stagef: 'stagef',
  Local: 'local',
} as const;

export type ENVType = (typeof ENVType)[keyof typeof ENVType];

export const ENV: ENVType = (process.env.NEXT_PUBLIC_APP_ENV as ENVType) || ENVType.Prod;

export const IS_ENV_PROD = ENV === ENVType.Prod;
export const IS_ENV_DEV = ENV === ENVType.Dev;
export const IS_ENV_STAGEF = ENV === ENVType.Stagef;
export const IS_ENV_LOCAL = ENV === ENVType.Local;

export const IS_CLIENT = typeof window !== 'undefined';
