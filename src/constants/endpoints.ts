import { ENVType } from '../config';

export const GAS_API_ENDPOINTS = {
  [ENVType.Local]: 'https://gas-api.dev.magic.link',
  [ENVType.Dev]: 'https://gas-api.dev.magic.link',
  [ENVType.Stagef]: 'https://gas-api.stagef.magic.link',
  [ENVType.Prod]: 'https://gas-api.magic.link',
} as const;

export const EVENT_LOG_API_ENDPOINTS = {
  [ENVType.Local]: 'https://events-int.magic.link/v1',
  [ENVType.Dev]: 'https://events-int.magic.link/v1',
  [ENVType.Stagef]: 'https://events-int.magic.link/v1',
  [ENVType.Prod]: 'https://events.magic.link/v1',
} as const;
