import { LinkWithIcon } from '@components/partials/quickstart-embedded-wallet/link-with-icon/link-with-icon';
import { QUICKSTART_LINKS } from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-config';
import { Ribbon } from '@components/presentation/ribbon/ribbon';
import { AUTH_APP, type AppType } from '@constants/appInfo';
import { Button, IcoCodeSandbox, IcoDismiss, IcoLightningFill, Text } from '@magiclabs/ui-components';
import { Divider, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

interface HeaderProps {
  onClose: () => void;
  appType: AppType;
}

export const QuickstartRibbon = ({ onClose, appType }: HeaderProps) => (
  <Ribbon
    size="bg"
    appType={appType}
    style={{
      background: `linear-gradient(78.78deg, ${token('colors.brand.base')} 15.81%, ${
        appType === AUTH_APP ? '#90def0' : '#CE99FF'
      } 108.91%), linear-gradient(0deg, ${token('colors.surface.primary')}, ${token('colors.surface.primary')})`,
    }}
  >
    <HStack gap={3}>
      <IcoLightningFill width={16} height={16} color={token('colors.surface.primary')} />
      <Text size="xs" fontWeight="semibold" fontColor="text.quaternary">
        QUICK START
      </Text>
    </HStack>
    <HStack alignItems="center">
      <LinkWithIcon
        color={token('colors.surface.primary')}
        title="CodeSandbox"
        href={QUICKSTART_LINKS.CODESANDBOX[appType]}
        icon={IcoCodeSandbox}
        hideTitleOnMobile
      />
      <Divider orientation="vertical" ml={2} h={4} color="surface.primary" />
      <Button variant="text" size="sm" onPress={onClose} aria-label="dismiss">
        <Button.LeadingIcon color={token('colors.surface.primary')}>
          <IcoDismiss />
        </Button.LeadingIcon>
      </Button>
    </HStack>
  </Ribbon>
);
