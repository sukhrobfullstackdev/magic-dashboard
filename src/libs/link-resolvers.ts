import { ENV, IS_ENV_LOCAL, IS_ENV_PROD } from '@config';
import { type AnchorHTMLAttributes } from 'react';

const magicUrl = new URL('https://magic.link');

function normalizeSlashes(source: string) {
  return source.replace(/\/+/g, '/');
}

function appendEnvToMagicLink(href: string, appendEnv = false) {
  let result = new URL(href).href;
  const isMagicHref = href.includes(magicUrl.host);

  if (isMagicHref && !IS_ENV_PROD && !IS_ENV_LOCAL && appendEnv) {
    result = href.replace(magicUrl.host, `${ENV}.${magicUrl.host}`);
  }

  return result;
}

export function createAnchorTagProps(
  href: string | URL,
  options?: { appendEnv?: boolean },
): Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> {
  const hrefResolved = href instanceof URL ? href.href : href;

  return {
    href: appendEnvToMagicLink(hrefResolved, options?.appendEnv),
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

export const magicLegalLink = (endpoint: string) => {
  return createAnchorTagProps(new URL(normalizeSlashes(`/legal/${endpoint}`), magicUrl), { appendEnv: false });
};

export const magicDocsLink = createAnchorTagProps(new URL('https://docs.magic.link'));

export const colorContrastStandardsLink = createAnchorTagProps(
  new URL('https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'),
);

/* TODO: Find link for magic */
export const magicGuidesLink = createAnchorTagProps(new URL('https://magic.link/guides'));

export const magicPreviewLink = (endpoint: string) =>
  createAnchorTagProps(new URL(normalizeSlashes(`/preview/${endpoint}`), 'https://auth.magic.link'), {
    appendEnv: true,
  });

export const magicSupportLink = createAnchorTagProps(new URL('https://help.magic.link/knowledge'));

export const magicDocsDomainAllowlistLink = createAnchorTagProps(
  new URL('https://magic.link/docs/authentication/security/allowlists/domain-allowlist'),
);
export const magicDocsRedirectAllowlistLink = createAnchorTagProps(
  new URL('https://magic.link/docs/authentication/security/allowlists/redirect-allowlist'),
);

export const magicDocsBundleAllowlistLink = createAnchorTagProps(
  new URL('https://magic.link/docs/authentication/security/allowlists/mobile-access-allow-listing'),
);
