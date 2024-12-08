import { IcoCheckmark, IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

type Props = {
  description: string | React.ReactNode;
  tooltip?: string | React.ReactNode;
};

export const FeatureRow = ({ description, tooltip }: Props) => {
  return (
    <HStack gap={2}>
      <IcoCheckmark color={token('colors.brand.lighter')} height="1rem" width="1rem" />
      <Text size="sm">{description}</Text>
      {tooltip && (
        <Tooltip
          width={234}
          placement="top left"
          content={
            <Text inline fontColor="text.tertiary" size="xs">
              {tooltip}
            </Text>
          }
        >
          <IcoQuestionCircleFill color={token('colors.neutral.primary')} height="0.75rem" width="0.75rem" />
        </Tooltip>
      )}
    </HStack>
  );
};
