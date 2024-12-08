import { DEFAULT_APP_LOGO_SRC, PASSPORT_APP } from '@constants/appInfo';
import type { AppInfoQueryKey, AuthMethodsQueryKey, PassportAppsQueryKey } from '@hooks/data/app/keys';
import type { AppInfo, AuthMethods } from '@hooks/data/app/types';
import { useDashboardStore } from '@hooks/data/store/store';
import { App } from '@hooks/data/user/types';
import { THEME_BRANDING_DEFAULT_VALUE } from '@interfaces/client';
import { parseClientInfoToApp } from '@libs/parse-client-info-to-app';
import { getAuthConfig } from '@services/auth-method-config';
import { getClientInfo } from '@services/client';
import { getAppAndKeyInfo, listApps } from '@services/passport';
import { type QueryFunction } from '@tanstack/react-query';
import { fromUnixTime } from 'date-fns';

export const makeAppInfoFetcher =
  (): QueryFunction<AppInfo, AppInfoQueryKey> =>
  async ({ queryKey: [, { appId, appType }] }) => {
    const response = appType === PASSPORT_APP ? await getAppAndKeyInfo(appId) : await getClientInfo(appId);

    return {
      appId: response.magic_client_id ?? '',
      appName: response.app_name ?? '',
      appType: response.app_type ?? appType,
      appLogoUrl: response.asset_uri ?? DEFAULT_APP_LOGO_SRC,

      teamId: response.team_id ?? '',
      teamOwnerEmail: response.team_owner_email ?? '',

      liveApiKeyId: response.app_key_id ?? '',
      liveApiKey: response.live_api_key ?? '',
      liveSecretKey: response.live_secret_key ?? '',
      keysCreatedAt: response.api_key_creation_timestamp
        ? fromUnixTime(response.api_key_creation_timestamp)
        : new Date(0),

      featureFlags: {
        is_fiat_onramp_enabled: response.features?.is_fiat_onramp_enabled ?? false,
        is_gasless_transactions_enabled: response.features?.is_gasless_transactions_enabled ?? false,
        is_nft_viewer_enabled: response.features?.is_nft_viewer_enabled ?? false,
        is_nft_transfer_enabled: response.features?.is_nft_transfer_enabled ?? false,
        is_send_transaction_ui_enabled: response.features?.is_send_transaction_ui_enabled ?? false,
        is_signing_ui_enabled: response.features?.is_signing_ui_enabled ?? false,
        is_wallet_ui_enabled: response.features?.is_wallet_ui_enabled ?? false,
        is_transaction_confirmation_enabled: response.features?.is_transaction_confirmation_enabled ?? false,
        is_google_autolinking_enabled: response.features?.is_google_autolinking_enabled ?? false,
      },
      checklistFlags: {
        is_quickstart_complete: response.checklist_status?.is_quickstart_complete ?? false,
      },
      authMethodsFlags: {
        is_sms_enabled: response.magic_client_auth_methods?.is_sms_enabled ?? false,
        is_coinbase_wallet_enabled: response.magic_client_auth_methods?.is_coinbase_wallet_enabled ?? false,
        is_email_enabled: response.magic_client_auth_methods?.is_email_enabled ?? false,
        is_metamask_wallet_enabled: response.magic_client_auth_methods?.is_metamask_wallet_enabled ?? false,
        is_mfa_enabled: response.magic_client_auth_methods?.is_mfa_enabled ?? false,
        is_wallet_connect_enabled: response.magic_client_auth_methods?.is_wallet_connect_enabled ?? false,
        is_webauthn_enabled: response.magic_client_auth_methods?.is_webauthn_enabled ?? false,
      },
      etcFlags: {
        is_allowlist_enforced: response.is_allowlist_enforced ?? false,
        is_interop_toggle_enabled: response.is_interop_toggle_enabled ?? false,
        is_magic_connect_enabled: response.is_magic_connect_enabled ?? false,
        is_security_otp_enabled: response.is_security_otp_enabled ?? false,
        device_verification_enabled: response.device_verification_enabled ?? false,
      },
      themeInfo: {
        asset_uri: response.theme_info?.asset_uri ?? DEFAULT_APP_LOGO_SRC,
        is_default_asset: response.theme_info?.is_default_asset ?? true,
        button_color: response.theme_info?.button_color,
        theme_color: response.theme_info?.theme_color ?? 'auto',
        custom_branding_type: response.theme_info?.custom_branding_type ?? THEME_BRANDING_DEFAULT_VALUE,
      },
    };
  };

export const makeAuthMethodsFetcher =
  (): QueryFunction<AuthMethods, AuthMethodsQueryKey> =>
  async ({ queryKey: [, { appId }] }) => {
    const response = await getAuthConfig(appId);

    return response.data?.auth_methods ?? [];
  };

export const makePassportAppsFetcher = (): QueryFunction<App[], PassportAppsQueryKey> => async () => {
  const { isPassportFlowEnabled, magicTeams, teamId } = useDashboardStore.getState();

  let passportApps: App[] = [];
  if (isPassportFlowEnabled) {
    const appsPromises = magicTeams.map((team) => listApps(team.teamId));
    passportApps = (await Promise.all(appsPromises)).flat().map((app) => ({
      ...parseClientInfoToApp(app, teamId),
      appType: PASSPORT_APP,
      appTermsOfServiceUri: app.terms_of_service_uri,
      appPrivacyPolicyUri: app.privacy_policy_uri,
      createdAt: app.created_at,
    }));
  }

  return passportApps;
};
