import { type AppType } from '@constants/appInfo';
import { HStack } from '@styled/jsx';
import { type ReactNode } from 'react';

interface HeaderProps {
  appType?: AppType;
  children: ReactNode;
  style?: object;
  size?: 'sm' | 'bg';
  color?: 'warning' | 'magic';
}

export const Ribbon = ({ children, style: customizedStyles, size = 'bg', color = 'magic' }: HeaderProps) => {
  return (
    <HStack
      justifyContent="space-between"
      roundedTop="2xl"
      fontSize="xs"
      lineHeight={1.5}
      px={size === 'bg' ? 8 : 6}
      py={size === 'bg' ? 4 : 3}
      bg={color === 'magic' ? 'brand.base' : 'warning.lighter'}
      color={color === 'magic' ? 'surface.primary' : 'text.primary'}
      style={{ ...customizedStyles }}
    >
      {children}
    </HStack>
  );
};
