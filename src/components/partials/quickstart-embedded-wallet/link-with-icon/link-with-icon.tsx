import { Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { type ElementType } from 'react';

interface LinkWithIconProps {
  color: string;
  title: string;
  href: string;
  icon: ElementType;
  hideTitleOnMobile?: boolean;
}

export const LinkWithIcon = ({ color, title, href, icon: Icon, hideTitleOnMobile = false }: LinkWithIconProps) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <HStack>
        <Icon width={16} height={16} color={color} />
        <Box smDown={{ display: hideTitleOnMobile ? 'none' : 'block' }}>
          <Text size="xs" fontWeight="semibold" styles={{ color }}>
            {title}
          </Text>
        </Box>
      </HStack>
    </a>
  );
};
