import { HStack } from '@styled/jsx';
import { type ReactNode } from 'react';

export type Props = {
  sizeVariant?: 'small' | 'medium';
  children: ReactNode;
};

export const Chip = ({ sizeVariant = 'medium', children }: Props) => {
  return (
    <HStack
      color="brand.base"
      bg="brand.lightest"
      textTransform="uppercase"
      borderRadius={6}
      fontWeight={600}
      style={{
        padding: sizeVariant === 'small' ? '4px 8px' : '6px 8px',
        fontSize: sizeVariant === 'small' ? '10px' : '14px',
      }}
    >
      {children}
    </HStack>
  );
};
