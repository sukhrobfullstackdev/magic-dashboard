import { AllowlistEntryType } from '@components/partials/settings/access-allowlist-card/access-allowlist-card';

export const isAllowlistTypeDomain = (type: AllowlistEntryType): boolean => type === AllowlistEntryType.DOMAIN;

export const isAllowlistTypeBundle = (type: AllowlistEntryType): boolean => type === AllowlistEntryType.BUNDLE;

export const isAllowlistTypeRedirect = (type: AllowlistEntryType): boolean => type === AllowlistEntryType.REDIRECT;
