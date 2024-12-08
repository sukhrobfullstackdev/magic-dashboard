import { Switch, Text } from '@magiclabs/ui-components';
import { Flex } from '@styled/jsx';

type Props = {
  checked: boolean;
  onPress: () => void;
  disabled: boolean;
};

export const AnnualBillingToggle = ({ checked, onPress, disabled }: Props) => {
  return (
    <Flex
      onClick={onPress}
      justifyContent="space-between"
      px={4}
      py={3}
      bg={checked ? 'brand.lightest' : 'neutral.quaternary'}
      rounded="lg"
      minW="304px"
      opacity={disabled ? 0.6 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      <Text size="sm">Save 10% with annual billing</Text>
      <Switch checked={checked} onChange={onPress} disabled={disabled} />
    </Flex>
  );
};
