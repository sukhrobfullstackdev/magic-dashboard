import { AppType, type APP_AUTH_METHOD_NAMES } from '@constants/appInfo';
import {
  type ClientInfoAuthMethods,
  type ClientInfoChecklistStatus,
  type ClientInfoFeatures,
  type CustomBrandingType,
} from '@interfaces/client';
import { type AuthMethod } from '@services/auth-method-config';

// RETURN TYPES

export type AppInfo = {
  appId: string;
  appName: string;
  appType: AppType;
  appLogoUrl: string;
  teamId: string;
  teamOwnerEmail: string;
  liveApiKeyId: string;
  liveApiKey: string;
  liveSecretKey: string;
  keysCreatedAt: Date;
  featureFlags: ClientInfoFeatures;
  authMethodsFlags: ClientInfoAuthMethods;
  checklistFlags: ClientInfoChecklistStatus;
  etcFlags: {
    is_allowlist_enforced: boolean;
    is_interop_toggle_enabled: boolean;
    is_magic_connect_enabled: boolean;
    is_security_otp_enabled: boolean;
    device_verification_enabled: boolean;
  };
  themeInfo: {
    asset_uri: string; // Logo
    is_default_asset: boolean;
    button_color?: string; // Primary color
    theme_color: 'auto' | 'dark' | 'light'; // Theme type
    custom_branding_type: CustomBrandingType;
  };
};

export type AuthMethods = Array<AuthMethod>;

//APP_AUTH_METHODS
export type AppAuthMethodName = (typeof APP_AUTH_METHOD_NAMES)[keyof typeof APP_AUTH_METHOD_NAMES];

// PARAMS
export type CreateAppParams = {
  email: string;
  appName: string;
  teamId: string;
  appType: AppType;
};

export type AppInfoParams = {
  appId: string;
  appType: AppType;
};

export type UpdateAppAuthMethodParams = {
  appId: string;
  appType: AppType;
  name: AppAuthMethodName;
  isActive: boolean;
};

export type UpdateAppAuthMethodsParams = {
  appId: string;
  appType: AppType;
  authMethods: AuthMethods;
};

export type RollKeysParams = {
  appId: string;
  appType: AppType;
  appKeyId?: string;
};

export type EditAppNameParams = {
  appId: string;
  appType: AppType;
  name: string;
};

export type EditTermsAndPoliciesParams = {
  appId: string;
  termsOfService?: string | null;
  privacyPolicy?: string | null;
};

export type UploadPassportLogoParams = {
  appId: string;
  formData: FormData;
};

export type UpdatePassportAppLogoParams = {
  appId: string;
  appLogoUrl: string | null;
};

export type AuthMethodsParams = {
  appId: string;
  appType: AppType;
};

export type DismissQuickStartParams = {
  appId: string;
  appType: AppType;
};

export type SetSecurityOtpFlagParams = {
  appId: string;
  appType: AppType;
  enabled: boolean;
};

export type UpdateAppInfoParams = Partial<Pick<AppInfo, 'appName' | 'featureFlags' | 'checklistFlags'>> & {
  appId: string;
  appType: AppType;
  etcFlags?: {
    is_security_otp_enabled?: boolean;
  };
};
