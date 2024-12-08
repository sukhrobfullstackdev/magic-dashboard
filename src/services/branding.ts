import { BACKEND_URL } from '@config';
import { type CustomBrandingType } from '@interfaces/client';
import { logger } from '@libs/datadog';
import { getCSRFToken } from '@libs/get-csrf-token';
import { Post } from '@services/http/magic-rest';

// TODO: Create a function for reusing api calls with formData on magic-rest module - AwkwardKore
export const uploadMagicClientLogo = async (formData: FormData) => {
  const adjustedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`;
  const endpoint = `${adjustedBackendUrl}v1/dashboard/magic_client/logo/upload`;

  const myFetchOptions = {
    headers: new Headers({ 'X-Magic-CSRF': getCSRFToken() }),
    withCredentials: true,
    credentials: 'include',
    method: 'POST',
    body: formData,
  };

  try {
    const response = await fetch(endpoint, myFetchOptions as RequestInit);
    if (!response.ok) {
      throw new Error('Failed to upload magic client logo');
    }

    return { data: (await response.json()).data };
  } catch (err: unknown) {
    logger.error('There was an issue uploading magic client logo', {}, err as Error);
    return { error: err };
  }
};

/*
 * Leave this function so we can use the response on Dashboard test mode
export const mockUploadMagicClientLogo = async () => {
  return Promise.resolve({
    asset_uri:
      'https://assets.dev.fortmatic.com/MagicLogos/6db1343f0df3843f0e9b5f596f4fb626/f8b4f4c875882df0f256f79542ea8825.jpg',
    asset_path: 'MagicLogos/6db1343f0df3843f0e9b5f596f4fb626/f8b4f4c875882df0f256f79542ea8825.jpg',
  });
};
*/

export const confirmUpdateTheme = async (
  magic_client_id: string,
  asset_path: string,
  theme_color: 'dark' | 'light' | 'auto',
  button_color: string,
  remove_asset: boolean,
  custom_branding_type: CustomBrandingType,
) => {
  const endpoint = 'v1/dashboard/magic_client/theme/save';
  try {
    const { data } = await Post(endpoint, {
      magic_client_id,
      asset_path,
      theme_color,
      button_color,
      remove_asset,
      custom_branding_type,
    });

    return { data };
  } catch (error) {
    return { error };
  }
};
