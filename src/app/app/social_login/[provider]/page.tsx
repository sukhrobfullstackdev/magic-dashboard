import { SocialLoginSettingsView } from '@components/views/social-login-settings-view';
import { providers } from '@components/views/social-login-settings-view/providers';
import { Metadata } from 'next';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(providers).map((p) => ({ provider: p }));
}

export default SocialLoginSettingsView;
export const metadata: Metadata = { title: 'Dashboard - Social' };
