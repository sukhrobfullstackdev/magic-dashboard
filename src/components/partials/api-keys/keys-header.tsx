import { APP_LABEL, AppType } from '@constants/appInfo';
import { Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';

type KeysHeaderProps = {
  appType: AppType;
};

export const KeysHeader = ({ appType }: KeysHeaderProps) => (
  <HStack justifyContent="space-between">
    <Text.H4 fontWeight="semibold">API Keys</Text.H4>
    <Text size="sm" fontColor="text.tertiary">
      {APP_LABEL[appType].long}
    </Text>
  </HStack>
);
