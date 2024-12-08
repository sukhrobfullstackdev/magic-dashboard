import { css } from '@styled/css';
import { Circle, HStack } from '@styled/jsx';
import { type PropsWithChildren } from 'react';

type Props = {
  children: React.ReactNode[];
};

const LogoCircle = ({ children }: PropsWithChildren) => {
  return (
    <Circle
      bgColor="surface.primary"
      borderColor="neutral.secondary"
      borderStyle="solid"
      borderWidth="thin"
      h={10}
      w={10}
      ml="-1rem"
    >
      {children}
    </Circle>
  );
};

export const StackedIcons = ({ children }: Props) => {
  return (
    <HStack
      className={css({
        pl: '1rem',
        _last: { maskImage: 'linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0.88) 70.14%, rgba(0, 0, 0, 0) 95.26%)' },
      })}
    >
      {children.map((child, index) => (
        // skipcq: JS-0437
        <LogoCircle key={`stacked-icon-#${index}`}>{child}</LogoCircle>
      ))}
    </HStack>
  );
};
