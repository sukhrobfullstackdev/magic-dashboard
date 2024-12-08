import { Text } from '@magiclabs/ui-components';
import { Center, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { createHost, createSlot } from 'create-slots';
import React, { Children, cloneElement } from 'react';

const Icon = createSlot(({ children, ...props }) => {
  return (
    <Center>
      {Children.map(children, (child) => {
        return cloneElement(child, props);
      })}
    </Center>
  );
});

const Action = createSlot(({ children, ...props }) => {
  return (
    <Center>
      {Children.map(children, (child) => {
        return cloneElement(child, {
          ...props,
          width: '28px',
          height: '28px',
        });
      })}
    </Center>
  );
});

const Label = createSlot('h4');

export type AuthMethodCardProps = React.ComponentPropsWithoutRef<'div'> & {
  enabled?: boolean;
};

export const AuthMethodCard = ({ enabled = true, ...rest }: AuthMethodCardProps) => {
  return createHost(rest.children, (Slots) => {
    const icon = Slots.get(Icon);
    const action = Slots.get(Action);
    const labelProps = Slots.getProps(Label);

    return (
      <HStack
        justifyContent="space-between"
        px={6}
        w="full"
        h={20}
        maxW="416px"
        boxSizing="border-box"
        rounded="xl"
        bg={enabled ? 'surface.primary' : 'surface.tertiary'}
        {...rest}
      >
        <HStack gap="1.125rem">
          {icon && {
            ...icon,
            props: { ...icon.props, color: enabled ? token('colors.brand.base') : token('colors.neutral.primary') },
          }}
          {labelProps && (
            <Text.H4 fontColor={enabled ? 'text.primary' : 'text.tertiary'} fontWeight="medium" {...labelProps} />
          )}
        </HStack>
        {action}
      </HStack>
    );
  });
};

AuthMethodCard.Icon = Icon;
AuthMethodCard.Label = Label;
AuthMethodCard.Action = Action;
