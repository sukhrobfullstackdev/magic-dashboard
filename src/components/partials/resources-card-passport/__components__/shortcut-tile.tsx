import { Text } from '@magiclabs/ui-components';
import { hstack } from '@styled/patterns';
import Link from 'next/link';
import { ReactNode } from 'react';

type ShortcutTileProps = {
  label: string;
  icon: ReactNode;
  href: string;
};

const ShortcutTile = ({ label, icon, href }: ShortcutTileProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={hstack({
        w: 'full',
        h: 'full',
        // Should be 4 per figma, but causes new line wrap
        px: 3,
        py: 3,
        gap: 3,
        boxSizing: 'border-box',
        borderColor: 'neutral.secondary',
        borderWidth: 'thin',
        rounded: 10,
        transition: 'border-color 0.1s',
        _hover: {
          borderColor: 'neutral.primary',
        },
      })}
      style={{ textDecoration: 'none' }}
    >
      {icon}
      <Text size="sm" styles={{ fontWeight: 500 }}>
        {label}
      </Text>
    </Link>
  );
};

export default ShortcutTile;
