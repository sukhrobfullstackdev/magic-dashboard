import { Switch, Text } from '@magiclabs/ui-components';
import { Flex, HStack, Stack } from '@styled/jsx';
import { Fragment, type ComponentProps, type ReactNode } from 'react';

interface Props extends Omit<ComponentProps<'button'>, 'ref'> {
  checked?: boolean;
  onPress?: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error';
  label?: string;
  description?: string | ReactNode;
  children?: JSX.Element;
}

export const FeatureToggleCard = ({ label, description, children, checked, onPress, disabled }: Props) => {
  return (
    <Fragment key={label}>
      <Stack gap={5} p={6} rounded="xl" bg="neutral.tertiary">
        <Flex justifyContent="space-between">
          {children ? (
            <HStack gap={3}>
              <Text fontWeight="semibold">{label}</Text>
              {children}
            </HStack>
          ) : (
            <Text fontWeight="semibold">{label}</Text>
          )}
          <Switch checked={checked} onPress={onPress} disabled={disabled} />
        </Flex>
        <Text>{description}</Text>
      </Stack>
    </Fragment>
  );
};
