import { ENV, ENVType, IS_CLIENT, MAGIC_API_KEY, MAGIC_AUTH_ENDPOINT } from '@config';
import { OAuthExtension } from '@magic-ext/oauth2';
import { Magic } from 'magic-sdk';

const API_KEYS = {
  [ENVType.Local]: MAGIC_API_KEY,
  [ENVType.Dev]: 'pk_test_35EAF28A8C8C0164',
  [ENVType.Stagef]: 'pk_live_CD8F5C0C43A10B97',
  [ENVType.Prod]: 'pk_live_4404D9451D29CFC5',
};

/* Migrate these to Magic endpoints */
export const MAGIC_ENDPOINTS = {
  [ENVType.Local]: MAGIC_AUTH_ENDPOINT,
  [ENVType.Dev]: 'https://auth.dev.magic.link',
  [ENVType.Stagef]: 'https://auth.stagef.magic.link',
  [ENVType.Prod]: 'https://auth.magic.link',
};

function createMagic<T extends Magic>(apiKey: string, endpoint: string): T {
  return IS_CLIENT ? (new Magic(apiKey, { endpoint }) as T) : ({} as T);
}

export const magic = createMagic(API_KEYS[ENV], MAGIC_ENDPOINTS[ENV]);

export function getOAuthMagicInstance(apiKey: string) {
  return IS_CLIENT
    ? new Magic(apiKey, {
        endpoint: MAGIC_ENDPOINTS[ENV],
        extensions: [new OAuthExtension()],
      })
    : null;
}
