import { Get, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface UserSearchData {
  id: string;
  auth_user_id: string;
  provenance: string;
  signup_ts: number;
  is_mfa_enabled: boolean;
}
export interface UserSearchResponse {
  users: UserSearchData[];
}

export async function searchForUser(magic_client_id: string, query: string, count = false) {
  const endpoint = `/v3/dashboard/magic_client/users?magic_client_id=${magic_client_id}&include_count=${count}&query=${query}`;

  try {
    const data = (await Get<FortmaticAPIResponse<UserSearchResponse>>(endpoint)).data;

    return { data };
  } catch (error) {
    return { error };
  }
}
