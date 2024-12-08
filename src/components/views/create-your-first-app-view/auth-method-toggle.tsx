import { Switch, Text } from '@magiclabs/ui-components';
import { Circle, HStack } from '@styled/jsx';
import { ElementType } from 'react';

type Props = {
  icon: ElementType;
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export const AuthMethodToggle = ({ icon: Icon, name, value, onChange }: Props) => {
  return (
    <HStack
      justifyContent="space-between"
      borderColor="neutral.secondary"
      borderRadius="xl"
      borderWidth="thin"
      px={6}
      py={4}
    >
      <HStack gap={4}>
        <Circle size={10} borderColor="neutral.secondary" borderWidth="thin">
          <Icon width={22} height={22} />
        </Circle>{' '}
        <Text.H4 fontWeight="medium">{name}</Text.H4>
      </HStack>
      <Switch checked={value} onChange={() => onChange(!value)} />
    </HStack>
  );
};
