'use client';

import { providers } from '@components/views/social-login-settings-view/providers';
import { createAnchorTagProps } from '@libs/link-resolvers';
import {
  LogoApple,
  LogoBitBucket,
  LogoDiscord,
  LogoFacebook,
  LogoGitHub,
  LogoGitLab,
  LogoGoogle,
  LogoLinkedIn,
  LogoMicrosoft,
  LogoTwitch,
  LogoTwitter,
} from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

type ProvidersConfig = {
  [key in providers]: {
    logo: React.ElementType;
    headline: string;
    authCardAccentColor?: string;
    labels: {
      provider: string;
      clientID: string;
      clientSecret: string;
      metadata?: Record<string, string>;
    };
    helpLinks: {
      setup?: ReturnType<typeof createAnchorTagProps>;
      demo?: ReturnType<typeof createAnchorTagProps>;
      credentials?: ReturnType<typeof createAnchorTagProps>;
      redirectURI?: ReturnType<typeof createAnchorTagProps>;
      autoLinkingDoc?: ReturnType<typeof createAnchorTagProps>;
    };
    autoLinking?: {
      label: string;
      description?: string;
      clientApiField: string;
    };
  };
};

export const providerConfigs: ProvidersConfig = {
  google: {
    logo: LogoGoogle,
    headline: 'Google',
    authCardAccentColor:
      'linear-gradient(to bottom, #ea4335 25%, #fbbc04 25%, #fbbc04 50%, #34a853 50%, #34a853 75%, #4285f4 75%)',
    labels: {
      provider: 'Google',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/google'),
      ),
      demo: createAnchorTagProps(new URL('https://63sxm9.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://console.developers.google.com/apis/credentials')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/google#google-setup'),
      ),
      autoLinkingDoc: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/google#gmail-linking'),
      ),
    },
    autoLinking: {
      label: 'Auto-Link Google and Email Sign-Ins',
      clientApiField: 'google_auto_linking_enabled',
    },
  },

  github: {
    logo: LogoGitHub,
    headline: 'GitHub',
    authCardAccentColor: token('colors.black'),
    labels: {
      provider: 'GitHub',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/github'),
      ),
      demo: createAnchorTagProps(new URL('https://qdwhtl.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://github.com/settings/developers')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/github#github-setup'),
      ),
    },
  },

  facebook: {
    logo: LogoFacebook,
    headline: 'Facebook',
    authCardAccentColor: '#1778f2',
    labels: {
      provider: 'Facebook',
      clientID: 'App ID',
      clientSecret: 'App Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/facebook'),
      ),
      demo: createAnchorTagProps(new URL('https://ojcz4b.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://developers.facebook.com/apps/')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/facebook#facebook-setup'),
      ),
    },
  },

  apple: {
    logo: LogoApple,
    headline: 'Apple',
    authCardAccentColor: token('colors.black'),
    labels: {
      provider: 'Apple',
      clientID: 'Service ID',
      clientSecret: 'Private Key',
      metadata: {
        kid: 'Key ID',
        team_id: 'Team ID',
      },
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/apple'),
      ),
      demo: createAnchorTagProps(new URL('https://5kkmud.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://developer.apple.com/account')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/apple#apple-setup'),
      ),
    },
  },
  linkedin: {
    logo: LogoLinkedIn,
    headline: 'LinkedIn',
    authCardAccentColor: '#0072B1',
    labels: {
      provider: 'LinkedIn',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/linkedin'),
      ),
      demo: createAnchorTagProps(new URL('https://642fzj.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://www.linkedin.com/developers/apps')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/linkedin#linkedin-setup'),
      ),
    },
  },

  bitbucket: {
    logo: LogoBitBucket,
    headline: 'Bitbucket',
    authCardAccentColor: '#0052CC',
    labels: {
      provider: 'Bitbucket',
      clientID: 'Key',
      clientSecret: 'Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/bitbucket'),
      ),
      demo: createAnchorTagProps(new URL('https://lgy5l2.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://confluence.atlassian.com/x/pwIwDg')),
      redirectURI: createAnchorTagProps(
        new URL(
          'https://magic.link/docs/authentication/login/social-logins/social-providers/bitbucket#bitbucket-setup',
        ),
      ),
    },
  },

  gitlab: {
    logo: LogoGitLab,
    headline: 'GitLab',
    authCardAccentColor: '#FC6D26',
    labels: {
      provider: 'GitLab',
      clientID: 'Application ID',
      clientSecret: 'Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/gitlab'),
      ),
      demo: createAnchorTagProps(new URL('https://hsheq7.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://gitlab.com/oauth/applications/')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/gitlab#gitlab-setup'),
      ),
    },
  },

  twitter: {
    logo: LogoTwitter,
    headline: 'X (Twitter)',
    authCardAccentColor: token('colors.black'),
    labels: {
      provider: 'X (Twitter)',
      clientID: 'API Key',
      clientSecret: 'Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/twitter'),
      ),
      demo: createAnchorTagProps(new URL('https://mpomp0.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://developer.twitter.com/en/portal/dashboard')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/twitter#twitter-setup'),
      ),
    },
  },

  discord: {
    logo: LogoDiscord,
    headline: 'Discord',
    authCardAccentColor: '#5865F2',
    labels: {
      provider: 'Discord',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/discord'),
      ),
      demo: createAnchorTagProps(new URL('https://0i556v.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://discord.com/developers/applications')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/discord#discord-setup'),
      ),
    },
  },

  twitch: {
    logo: LogoTwitch,
    headline: 'Twitch',
    authCardAccentColor: '#9146FF',
    labels: {
      provider: 'Twitch',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/twitch'),
      ),
      demo: createAnchorTagProps(new URL('https://zxw4q3.csb.app/')),
      credentials: createAnchorTagProps(new URL('https://dev.twitch.tv/console/apps')),
      redirectURI: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/twitch#twitch-setup'),
      ),
    },
  },

  microsoft: {
    logo: LogoMicrosoft,
    headline: 'Microsoft',
    authCardAccentColor:
      'linear-gradient(to bottom, #F14F21 25%, #7EB900 25%, #7EB900 50%, 	#00A3EE 50%, 	#00A3EE 75%, #FEB800 75%)',
    labels: {
      provider: 'Microsoft',
      clientID: 'Client ID',
      clientSecret: 'Client Secret',
    },
    helpLinks: {
      setup: createAnchorTagProps(
        new URL('https://magic.link/docs/authentication/login/social-logins/social-providers/microsoft'),
      ),
      demo: createAnchorTagProps(new URL('https://fh3mx2.csb.app/')),
      credentials: createAnchorTagProps(
        new URL('https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade'),
      ),
      redirectURI: createAnchorTagProps(
        new URL(
          'https://magic.link/docs/authentication/login/social-logins/social-providers/microsoft#microsoft-setup',
        ),
      ),
    },
  },
};

export const providerNameList = Object.keys(providers);
