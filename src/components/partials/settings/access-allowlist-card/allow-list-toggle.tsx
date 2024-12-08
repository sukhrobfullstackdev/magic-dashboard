import { IcoQuestionCircleFill, Switch, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

type AllowlistToggleProps = {
  header: string;
  tooltip: JSX.Element;
  enabled: boolean;
  onPress: () => void;
  allowlist: string[];
};

export const AllowlistToggle = ({ header, tooltip, enabled, onPress, allowlist }: AllowlistToggleProps) => (
  <HStack
    justifyContent="space-between"
    rounded="lg"
    flex={1}
    px={4}
    py={3}
    bg={enabled ? 'brand.lightest' : 'neutral.quaternary'}
  >
    <HStack gap={2}>
      <Text fontWeight="semibold">{header}</Text>
      <Tooltip
        content={
          <Text inline fontColor="text.tertiary" size="sm">
            {tooltip}
          </Text>
        }
      >
        <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={18} height={18} />
      </Tooltip>
    </HStack>
    <Switch disabled={enabled && allowlist.length > 0} onPress={onPress} checked={enabled} />
  </HStack>
);
