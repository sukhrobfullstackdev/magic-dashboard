import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface AllowlistItem {
  access_type: string;
  value: string;
}

export interface GetAllowlistedResponse {
  whitelisted_domains: string[];
  whitelisted_bundles: string[];
  whitelisted_redirect_urls: string[];
}

export async function addBatchAllowlist(magic_client_id: string, items: AllowlistItem[]) {
  const endpoint = 'v2/dashboard/magic_dashboard/access/whitelist';
  const body = { magic_client_id, items };

  try {
    const { data } = await Post(endpoint, body);

    return { data };
  } catch (error: unknown) {
    return { error };
  }
}

export async function getAllowlisted(magic_client_id: string) {
  const endpoint = `v2/dashboard/magic_dashboard/access/whitelist?magic_client_id=${magic_client_id}`;

  try {
    const { data } = await Get<FortmaticAPIResponse<GetAllowlistedResponse>>(endpoint);

    return { data };
  } catch (error: unknown) {
    return { error };
  }
}

export async function removeAllowlisted(magic_client_id: string, access_type: string, value: string) {
  const endpoint = 'v2/dashboard/magic_dashboard/access/whitelist/remove';
  const body = { magic_client_id, access_type, value };

  try {
    const { data } = await Post(endpoint, body);

    return { data };
  } catch (error: unknown) {
    return { error };
  }
}
