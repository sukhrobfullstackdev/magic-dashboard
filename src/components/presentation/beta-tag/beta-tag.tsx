import { Chip } from '@components/presentation/chip';
import { IcoInfoCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

export type Props = {
  sizeVariant?: 'small' | 'medium';
  tooltip?: JSX.Element | null;
  className?: string;
};

export const BetaTag = ({ tooltip, sizeVariant = 'medium' }: Props) => {
  return (
    <Chip sizeVariant={sizeVariant}>
      BETA
      {tooltip && (
        <Tooltip
          placement="right top"
          content={
            <Text inline fontColor="text.tertiary" size="sm" styles={{ textTransform: 'none' }}>
              {tooltip}
            </Text>
          }
        >
          <IcoInfoCircleFill color={token('colors.brand.lighter')} height="16px" width="16px" />
        </Tooltip>
      )}
    </Chip>
  );
};
