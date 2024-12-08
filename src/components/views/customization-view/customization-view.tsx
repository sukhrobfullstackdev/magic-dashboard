'use client';

import { LogoCard } from '@components/views/customization-view/logo-card';
import { TermsAndPoliciesCard } from '@components/views/customization-view/terms-and-policies-card';
import { EditAppNameCard } from '@components/views/settings-view/edit-app-name-card';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { App } from '@hooks/data/user/types';
import { Text } from '@magiclabs/ui-components';
import { Stack } from '@styled/jsx';

const Resolved = ({ app }: { app: App }) => {
  return (
    <Stack p={6} gap={6}>
      <Text.H3>Customization</Text.H3>
      <EditAppNameCard app={app} />
      <LogoCard app={app} />
      <TermsAndPoliciesCard app={app} />
    </Stack>
  );
};

export const CustomizationView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
