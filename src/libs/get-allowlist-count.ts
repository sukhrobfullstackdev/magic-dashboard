import { type GetAllowlistedResponse } from '@services/access-allowlisting';

export function getAllowlistCount(allowlist: GetAllowlistedResponse) {
  const { whitelisted_domains, whitelisted_bundles, whitelisted_redirect_urls } = allowlist;

  return whitelisted_bundles.length + whitelisted_domains.length + whitelisted_redirect_urls.length;
}
