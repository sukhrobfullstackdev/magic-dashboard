import { useAnalytics } from '@components/hooks/use-analytics';
import { clipboard } from '@libs/copy';
import { Text, TextBox } from '@magiclabs/ui-components';
import { Flex, Stack } from '@styled/jsx';

type ApiKeysProps = {
  liveApiKey: string;
  liveSecretKey: string;
};

export const ApiKeys = ({ liveApiKey, liveSecretKey }: ApiKeysProps) => {
  const { trackAction } = useAnalytics();

  const handleCopyPublicKey = () => {
    clipboard.writeText(liveApiKey);
    trackAction('Publishable API Key Copied', { keyType: 'pk_live' });
  };

  const handleCopySecretKey = () => {
    clipboard.writeText(liveSecretKey);
    trackAction('Secret API Key Copied', { keyType: 'sk_live' });
  };

  return (
    <Flex gap={7} wrap="wrap" smDown={{ flexDir: 'column' }}>
      <Stack id="box-api-key" flex={1} overflow="hidden">
        <Text size="sm" fontWeight="medium">
          Publishable API Key
        </Text>
        <TextBox content={liveApiKey || 'pk_live_...'} onCopy={handleCopyPublicKey} mono />
      </Stack>
      <Stack id="box-secret-key" flex={1} overflow="hidden">
        <Text size="sm" fontWeight="medium">
          Secret Key
        </Text>
        <TextBox content={liveSecretKey || 'sk_live_...'} onCopy={handleCopySecretKey} showHideButton mono />
      </Stack>
    </Flex>
  );
};
