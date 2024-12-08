import { call, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface PatchDeviceVerificationBody {
  client_id: string;
  device_verification_enabled: boolean;
  reason?: string;
}

export async function patchDeviceVerification(
  client_id: string,
  live_secret_key: string,
  device_verification_enabled: boolean,
  reason?: string,
) {
  const endpoint = 'v1/dashboard/magic_client/device_verification';
  const body = { client_id, device_verification_enabled, reason };

  const headers = new Headers({
    'X-Magic-Secret-Key': live_secret_key,
    'Content-Type': 'application/json',
  });

  const response = await call<PatchDeviceVerificationBody, FortmaticAPIResponse>('PATCH', endpoint, headers, body);

  return response;
}
