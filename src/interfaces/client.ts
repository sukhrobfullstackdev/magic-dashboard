import { type AppType } from '@constants/appInfo';
import { type TeamInfo } from '@interfaces/team';

export const THEME_BRANDING_DEFAULT_VALUE = 1;
export const THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE = 2;

export const THEME_BRANDING_DEFAULT = 'DEFAULT';
export const THEME_BRANDING_HIDE_MAGIC_LOGO = 'HIDE_MAGIC_LOGO';

export const CUSTOM_BRANDING_TYPE_VALUES = {
  [THEME_BRANDING_DEFAULT_VALUE]: THEME_BRANDING_DEFAULT,
  [THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE]: THEME_BRANDING_HIDE_MAGIC_LOGO,
};

export type CustomBrandingType = typeof THEME_BRANDING_DEFAULT_VALUE | typeof THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE;

export interface ClientInfo {
  app_name?: string;
  app_type?: AppType;
  user_count?: number;
  time_created?: string;
  created_at?: number;
  magic_client_id?: string;
  team_id?: string;
  team_owner_email?: string;
  team_name?: string;
  test_api_key?: string;
  test_secret_key?: string;
  app_key_id?: string;
  live_api_key?: string;
  live_secret_key?: string;
  api_key_creation_timestamp?: number;
  asset_uri?: string;
  terms_of_service_uri?: string;
  privacy_policy_uri?: string;
  is_default_asset?: boolean;
  is_magic_connect_enabled?: boolean;
  is_allowlist_enforced?: boolean;
  connect_interoperability?: ClientInfoConnectInteroperability; // is interop enabled for the specific MA app
  is_interop_toggle_enabled?: boolean; // feature flag on if user is part of beta
  device_verification_enabled?: boolean;
  is_security_otp_enabled?: boolean;
  features?: ClientInfoFeatures;
  magic_client_auth_methods?: ClientInfoAuthMethods;
  theme_info?: {
    asset_uri?: string; // Logo
    is_default_asset?: boolean;
    button_color?: string; // Primary color
    theme_color?: 'auto' | 'dark' | 'light'; // Theme type
    custom_branding_type: CustomBrandingType;
  };
  sales_enabled_app_features?: {
    is_session_customization_enabled?: boolean;
    is_mfa_enabled?: boolean;
    is_custom_smtp_enabled?: boolean; // redundant but for consistency
  };
  checklist_status?: ClientInfoChecklistStatus;
}

export interface ClientInfoAuthMethods {
  is_sms_enabled?: boolean;
  is_coinbase_wallet_enabled?: boolean;
  is_email_enabled?: boolean;
  is_metamask_wallet_enabled?: boolean;
  is_mfa_enabled?: boolean;
  is_wallet_connect_enabled?: boolean;
  is_webauthn_enabled?: boolean;
}

export interface ClientInfoFeatures {
  is_fiat_onramp_enabled?: boolean;
  is_gasless_transactions_enabled?: boolean;
  is_nft_viewer_enabled?: boolean;
  is_nft_transfer_enabled?: boolean;
  is_send_transaction_ui_enabled?: boolean;
  is_signing_ui_enabled?: boolean;
  is_wallet_ui_enabled?: boolean;
  is_transaction_confirmation_enabled?: boolean;
  is_google_autolinking_enabled?: boolean;
}

export interface ClientInfoChecklistStatus {
  is_quickstart_complete: boolean;
}

export type ClientInfoConnectInteroperability = 'ENABLED' | 'DISABLED' | null;

export type WidgetFeatures = Partial<ClientInfo['features']>;

// Partial models from /v1/dashboard/magic_api_user/info
export interface ShallowClientInfo {
  app_name?: string;
  app_type?: string;
  time_created?: Date;
  asset_uri?: string;
  magic_client_id?: string;
  is_default_asset?: boolean;
  team_owner_email?: string;
  team_id?: string;
  team_name?: string;
  is_sms_enabled?: boolean;
  is_allowlist_enforced?: boolean;
}

export interface CurrentUserInfo {
  developerId: string;
  developerEmail: string;
  publicAddress: string;
  clients: ClientInfo[];
  team: TeamInfo;
}

export interface LogoFile {
  asset_uri?: string;
  is_default_asset?: boolean;
  asset_path?: string;
}
