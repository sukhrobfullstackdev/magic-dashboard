import { AppType, AUTH_APP, CONNECT_APP, EMBEDDED_APP } from '@constants/appInfo';
import { IconDedicated, IconPassport, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';

type ProductLabelProps = {
  appType?: AppType;
};

const productDict = {
  passport: {
    label: 'PASSPORT',
    Icon: IconPassport,
    tooltip:
      'You’re building a Passport app, a plug-and-play, multi-chain smart wallet designed for seamless global interoperability.',
  },
  auth: {
    label: 'DEDICATED',
    Icon: IconDedicated,
    tooltip:
      'You’re building a Dedicated app, giving you complete control to customize the wallet experience from start to finish.',
  },
};

export const ProductLabel = ({ appType }: ProductLabelProps) => {
  const productType = appType === EMBEDDED_APP ? AUTH_APP : appType;

  if (!productType || productType === CONNECT_APP) return null;

  const { label, Icon, tooltip } = productDict[productType];

  return (
    <Tooltip
      width="13.75rem"
      placement="top right"
      content={
        <Text inline size="xs" fontColor="text.tertiary">
          {tooltip}
        </Text>
      }
    >
      <HStack bg="neutral.quaternary" px={2} py={1.5} gap={2} w="fit-content" rounded="md" userSelect="none">
        <Icon width={16} height={16} />
        <Text size="xs" fontColor="text.tertiary" fontWeight="semibold" styles={{ letterSpacing: '0.72px' }}>
          {label}
        </Text>
      </HStack>
    </Tooltip>
  );
};
