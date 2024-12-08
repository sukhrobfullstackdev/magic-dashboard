'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { NewTemplateCard } from '@components/views/email-customization-view/dashboard-view/new-template-card';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useTemplateBindingsSuspenseQuery } from '@hooks/data/email-customization';
import { emailCustomizationQueryKeys } from '@hooks/data/email-customization/keys';
import { type App } from '@hooks/data/user/types';
import { Button, IcoAdd, Text } from '@magiclabs/ui-components';
import { Flex, HStack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { TemplateCard } from './template-card';

const Resolved = ({ app }: { app: App }) => {
  const router = useRouter();
  const { trackAction } = useAnalytics();

  const { data: templateBindings } = useTemplateBindingsSuspenseQuery(
    emailCustomizationQueryKeys.templateBindings({
      appId: app.appId,
    }),
  );

  const handleClickNewTemplate = () => {
    trackAction('New template clicked');

    router.push(`/app/email_customization/new_template?cid=${app.appId}`);
  };

  return (
    <Flex padding={6} direction="column" gap={4}>
      <HStack justifyContent="space-between">
        <Text.H3>Custom Email Templates</Text.H3>
        <Button size="sm" label="New template" onPress={handleClickNewTemplate}>
          <Button.LeadingIcon>
            <IcoAdd />
          </Button.LeadingIcon>
        </Button>
      </HStack>

      <Flex wrap="wrap">
        {templateBindings
          .filter((v) => v.variation !== 'default')
          .map((v) => (
            <TemplateCard key={v.id} templateBinding={v} />
          ))}
        <NewTemplateCard onClick={handleClickNewTemplate} />
      </Flex>
    </Flex>
  );
};

export const EmailCustomizationDashboardView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
