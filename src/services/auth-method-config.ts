import { Get, Put } from '@services/http/magic-rest';

export type AuthMethodName =
  | 'link'
  | 'sms'
  | 'webauthn'
  | 'mfa'
  | 'coinbase_wallet'
  | 'metamask_wallet'
  | 'wallet_connect';

export type AuthMethod = {
  name: AuthMethodName;
  is_active: boolean;
};

export type AuthMethodsConfiguration = {
  auth_methods: Array<AuthMethod>;
};

export async function getAuthConfig(magic_client_id: string) {
  try {
    const endpoint = `/v1/dashboard/magic_client/auth_methods?magic_client_id=${magic_client_id}`;
    const response = await Get(endpoint);

    return { data: response.data as AuthMethodsConfiguration };
  } catch (error) {
    return { error };
  }
}

export async function updateAuthConfig(magic_client_id: string, config: AuthMethodsConfiguration) {
  try {
    const endpoint = '/v1/dashboard/magic_client/auth_methods';
    const body = { magic_client_id, ...config };
    await Put(endpoint, body);

    return { data: 'Successful auth config update' };
  } catch (error) {
    return { error };
  }
}
