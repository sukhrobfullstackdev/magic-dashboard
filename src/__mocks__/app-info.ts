import { AppType, AUTH_APP, PASSPORT_APP } from '@constants/appInfo';
import { CustomBrandingType } from '@interfaces/client';

export const mockPassportAppInfo = {
  appId: 'test1234',
  appName: 'test-app',
  appType: PASSPORT_APP as AppType,
  appLogoUrl: 'https://test.com',
  teamId: '1234',
  teamOwnerEmail: 'test@email.com',
  liveApiKeyId: '1234',
  liveApiKey: 'pk_live_1234',
  liveSecretKey: 'sk_live_1234',
  keysCreatedAt: new Date(),
  featureFlags: {},
  authMethodsFlags: {},
  checklistFlags: {
    is_quickstart_complete: false,
  },
  etcFlags: {
    is_allowlist_enforced: true,
    is_interop_toggle_enabled: true,
    is_magic_connect_enabled: true,
    is_security_otp_enabled: true,
    device_verification_enabled: true,
  },
  themeInfo: {
    asset_uri: 'https://test.com',
    is_default_asset: false,
    theme_color: 'auto' as 'auto' | 'dark' | 'light',
    custom_branding_type: 1 as CustomBrandingType,
  },
};

export const mockDedicatedAppInfo = {
  appId: 'test1234',
  appName: 'test-app',
  appType: AUTH_APP as AppType,
  appLogoUrl: 'https://test.com',
  teamId: '1234',
  teamOwnerEmail: 'test@email.com',
  liveApiKeyId: '1234',
  liveApiKey: 'pk_live_1234',
  liveSecretKey: 'sk_live_1234',
  keysCreatedAt: new Date(),
  featureFlags: {},
  authMethodsFlags: {},
  checklistFlags: {
    is_quickstart_complete: false,
  },
  etcFlags: {
    is_allowlist_enforced: true,
    is_interop_toggle_enabled: true,
    is_magic_connect_enabled: true,
    is_security_otp_enabled: true,
    device_verification_enabled: true,
  },
  themeInfo: {
    asset_uri: 'https://test.com',
    is_default_asset: false,
    theme_color: 'auto' as 'auto' | 'dark' | 'light',
    custom_branding_type: 1 as CustomBrandingType,
  },
};
