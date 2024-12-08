import { CardBrand } from '@hooks/data/billing/types';
import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface Invoice {
  amount: number;
  sms_count: number;
  mau_count: number;
  month_year: string;
}

export interface GetInvoicesResponse {
  team_id: string;
  invoices: Invoice[];
}

export interface GetClientSecretResponse {
  client_secret: string;
}

export interface GetBillingInfoResponse {
  billing_info: {
    brand: CardBrand;
    last_four_digits: string;
    funding: string;
    name: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
    };
  };
}

export interface ApiUserStatusBody {
  email: string;
  challenge: string;
}

export interface ApiUserStatusResponse {
  status: string;
}

export async function getClientSecret() {
  const endpoint = '/v1/dashboard/magic_api_user/billing/setup';
  return (await Post<unknown, FortmaticAPIResponse<GetClientSecretResponse>>(endpoint)).data;
}

export async function getBillingInfo() {
  const endpoint = '/v1/dashboard/magic_api_user/billing/info';
  return (await Get<FortmaticAPIResponse<GetBillingInfoResponse>>(endpoint)).data;
}

export async function apiUserStatus(email: string, challenge: string) {
  const endpoint = '/v3/dashboard/magic_api_user/status';
  return (await Post<ApiUserStatusBody, FortmaticAPIResponse<ApiUserStatusResponse>>(endpoint, { email, challenge }))
    .data;
}

export async function getInvoices(
  magic_team_id: string,
): Promise<{ data: GetInvoicesResponse; error: null } | { data: null; error: Error }> {
  const endpoint = `/v1/dashboard/magic_team/get_mau_invoices?team_id=${magic_team_id}`;

  try {
    const response = await Get(endpoint);

    return { data: response.data as GetInvoicesResponse, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
