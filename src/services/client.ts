import { AUTH_APP, CONNECT_APP, type AppType } from '@constants/appInfo';
import {
  type ClientInfo,
  type ClientInfoChecklistStatus,
  type ClientInfoConnectInteroperability,
  type ClientInfoFeatures,
} from '@interfaces/client';
import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

interface GetClientInfoApiResponse extends FortmaticAPIResponse<ClientInfo> {}
export interface GetClientInfoResponse extends ClientInfo {
  app_type: AppType;
}

export interface CreateClientInfoBody {
  email: string;
  app_name: string;
  team_id: string;
  app_type: string;
}

export interface EditClientInfoBody {
  magic_client_id: string;
  app_name?: string;
  connect_interoperability?: ClientInfoConnectInteroperability;
  features?: ClientInfoFeatures;
  checklist_status?: Partial<ClientInfoChecklistStatus>;
  is_security_otp_enabled?: boolean;
}

export async function getClientInfo(client_id: string): Promise<GetClientInfoResponse> {
  const endpoint = `v1/dashboard/magic_client/info?magic_client_id=${client_id}`;
  const { data } = await Get<GetClientInfoApiResponse>(endpoint);
  return { app_type: (data.is_magic_connect_enabled ? CONNECT_APP : AUTH_APP) as AppType, ...data };
}

export async function createClient(email: string, app_name: string, team_id: string, app_type: string) {
  const endpoint = 'v1/dashboard/magic_client/create';
  const body = { email, app_name, team_id, app_type };
  return (await Post<CreateClientInfoBody, FortmaticAPIResponse<ClientInfo>>(endpoint, body)).data;
}

export async function deleteClient(magic_client_id: string) {
  const endpoint = 'v1/dashboard/magic_client/delete';
  const body = { magic_client_id };
  return (await Post(endpoint, body)).data;
}

export async function editClient(body: EditClientInfoBody) {
  const endpoint = 'v1/dashboard/magic_client/edit';
  return (await Post<EditClientInfoBody, FortmaticAPIResponse<object>>(endpoint, body)).data;
}
