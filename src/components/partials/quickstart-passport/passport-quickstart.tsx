import { useLocalStorage } from '@components/hooks/use-localstorage';
import { PassportCodeBlock } from '@components/partials/quickstart-passport/code-block/passport-code-block';
import { AppInfo } from '@hooks/data/app/types';
import { Button, Card, IcoDismiss, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

type PassportQuickstartProps = {
  appInfo: AppInfo;
};

export const PassportQuickstart = ({ appInfo }: PassportQuickstartProps) => {
  const [isPassportQuickstartDismissed, setIsPassportQuickstartDismissed] = useLocalStorage(
    `isPassportQuickstartDismissed-${appInfo.appId}`,
    false,
  );
  const cliCommandText = `npx make-magic ${appInfo.liveApiKey}`;

  if (isPassportQuickstartDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsPassportQuickstartDismissed(true);
  };

  return (
    <Card stack className={css({ gap: 8, position: 'relative' })}>
      <Stack w="full" justifyContent="space-between" alignItems="flex-start">
        <VStack alignItems="flex-start">
          <Text.H4 styles={{ fontWeight: 600 }}>Start building onchain apps, faster.</Text.H4>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            Get started with the CLI to onboard your users with Magic Passport in seconds.
          </Text>
        </VStack>
        <Box position="absolute" right={4} top={4}>
          <Button size="sm" variant="neutral" onPress={handleDismiss} aria-label="dismiss">
            <Button.LeadingIcon>
              <IcoDismiss />
            </Button.LeadingIcon>
          </Button>
        </Box>
      </Stack>
      <PassportCodeBlock codeBlockText={cliCommandText} />
    </Card>
  );
};
