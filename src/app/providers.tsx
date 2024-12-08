'use client';

import { DatadogRUM } from '@components/contexts/datadog-rum';
import { GAWithDeveloperEmail } from '@components/contexts/ga-with-developer-email';
import { Hubble } from '@components/contexts/hubble';
import { IntercomMessenger } from '@components/contexts/intercom-messenger';
import { LaunchDarklyProvider } from '@components/contexts/launch-darkly-provider';
import { Portal } from '@components/contexts/portal';
import { QueryProvider } from '@components/contexts/query-provider';
import { TwitterTracking } from '@components/contexts/twitter-tracking';
import { inter } from '@libs/fonts';
import { ToastProvider } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { SkeletonTheme } from 'react-loading-skeleton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LaunchDarklyProvider>
        <ToastProvider icon lifespan={1500} position="top">
          <SkeletonTheme
            duration={1.2}
            baseColor={token('colors.neutral.tertiary')}
            highlightColor={token('colors.neutral.secondary')}
          >
            <main className={inter.className}>{children}</main>
          </SkeletonTheme>
        </ToastProvider>
        <Portal />
      </LaunchDarklyProvider>

      <DatadogRUM />
      <TwitterTracking />
      <Hubble />
      <GAWithDeveloperEmail />
      <IntercomMessenger />
    </QueryProvider>
  );
}
