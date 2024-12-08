import { useKeyDown } from '@hooks/common/use-keydown';
import { IcoDiamond, Text } from '@magiclabs/ui-components';
import { Center, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';

export const TemplateEditorOverlay = () => {
  const router = useRouter();

  const handleUpgradeToGrowth = () => {
    router.push('/checkout/upgrade-to-growth');
  };

  return (
    <Center
      role="button"
      position="absolute"
      top={0}
      bottom={0}
      right={0}
      left={0}
      zIndex={2}
      onClick={handleUpgradeToGrowth}
      tabIndex={0}
      onKeyDown={useKeyDown(handleUpgradeToGrowth, ['Enter'])}
    >
      <HStack
        cursor="pointer"
        px={4}
        py={3}
        rounded={10}
        style={{ background: `linear-gradient(180deg, ${token('colors.brand.base')} 0%, #518cff 100%)` }}
      >
        <IcoDiamond width={22} height={22} color="white" />
        <Text styles={{ color: token('colors.chalk') }}>
          <b>Upgrade</b> to Growth Plan to unlock
        </Text>
      </HStack>
    </Center>
  );
};
