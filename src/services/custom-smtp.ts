import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';
import { type EmptyObject } from 'type-fest';

export interface CustomSmtpSettings {
  sender_email: string;
  sender_name: string;
  host: string;
  port: string;
  user_name: string;
  user_password: string;
}

export interface GetCustomSmtpInfoRes {
  is_custom_smtp_enabled: boolean;
  custom_smtp_settings: CustomSmtpSettings | EmptyObject;
}

export interface SaveCustomSmtpSettingsBody {
  magic_client_id: string;
  custom_smtp_settings: CustomSmtpSettings;
}

export type SmtpInfoResponse = FortmaticAPIResponse<GetCustomSmtpInfoRes>;

export async function getCustomSmtpInfo(magic_client_id: string) {
  const endpoint = `v1/dashboard/magic_dashboard/custom_smtp?magic_client_id=${magic_client_id}`;

  try {
    const data = (await Get<SmtpInfoResponse>(endpoint)).data;

    return { data };
  } catch (error) {
    return { error };
  }
}

export const customSmtpInfoFetcher = async (magic_client_id: string): Promise<SmtpInfoResponse> => {
  const endpoint = `v1/dashboard/magic_dashboard/custom_smtp?magic_client_id=${magic_client_id}`;
  return Get<SmtpInfoResponse>(endpoint);
};

export async function saveCustomSmtpSettings(custom_smtp_settings: CustomSmtpSettings, magic_client_id: string) {
  const endpoint = 'v1/dashboard/magic_dashboard/custom_smtp/update';
  const body = { magic_client_id, custom_smtp_settings };

  try {
    const data = (await Post<SaveCustomSmtpSettingsBody, FortmaticAPIResponse>(endpoint, body)).data;

    return { data };
  } catch (error) {
    return { error };
  }
}

export async function sendTestEmail(magic_client_id: string) {
  const endpoint = `v1/dashboard/magic_dashboard/custom_smtp/test?magic_client_id=${magic_client_id}`;

  const data = (await Get(endpoint)).data;

  return { data };
}
