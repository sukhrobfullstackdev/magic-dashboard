import { type CSPEntry } from '@components/partials/settings/content-security-policy-card/types';
import { Delete, Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

export async function addCSPEntry(client_id: string, value: string) {
  const endpoint = '/v1/api/magic_client/csp_source';
  const body = { client_id, type: 'connect-src', value };
  return (await Post(endpoint, body)).data;
}

export async function getCSPEntries(magic_client_id: string) {
  const endpoint = `/v1/api/magic_client/csp_source?client_id=${magic_client_id}&type=connect-src`;
  return (await Get<FortmaticAPIResponse<CSPEntry[]>>(endpoint)).data;
}

export async function removeCSPEntry(magic_client_id: string, id: string) {
  const endpoint = `/v1/api/magic_client/csp_source/${id}?client_id=${magic_client_id}`;
  return (await Delete(endpoint)).data;
}
