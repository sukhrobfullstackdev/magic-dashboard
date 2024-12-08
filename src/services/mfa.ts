import { Put } from '@services/http/magic-rest';

export async function disableMfa(magic_client_id: string, auth_user_id: string) {
  const endpoint = '/v1/dashboard/magic_client/user/mfa';
  await Put(endpoint, { auth_user_id, magic_client_id, is_disabled: true });
}
