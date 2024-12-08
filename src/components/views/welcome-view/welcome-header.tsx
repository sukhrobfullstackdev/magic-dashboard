import { Text } from '@magiclabs/ui-components';
import { Stack } from '@styled/jsx';

const WelcomeHeader = () => {
  return (
    <Stack>
      <Text.H1>Let&apos;s build your My app</Text.H1>
      <Text size="lg">You can change it later by creating a new app</Text>
    </Stack>
  );
};

export default WelcomeHeader;
