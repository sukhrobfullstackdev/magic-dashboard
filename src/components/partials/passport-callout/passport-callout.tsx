import { useLocalStorage } from '@components/hooks/use-localstorage';
import { useDashboardStore } from '@hooks/data/store/store';
import { ButtonContainer, IcoArrowRight, IcoDismiss, IcoMegaphone, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { useEffect, useRef, useState } from 'react';

interface PassportCalloutProps {
  condense?: boolean;
}

const textMap = {
  long: (
    <>
      Introducing Passport, the first chain abstracted smart wallet.{' '}
      <span className={css({ fontWeight: 'semibold' })}>Sign up for the&nbsp;waitlist</span>
    </>
  ),
  short: (
    <>
      Looking for Passport? <span className={css({ fontWeight: 'semibold' })}>Sign up for the waitlist</span>
    </>
  ),
};

export const PassportCallout = ({ condense = false }: PassportCalloutProps) => {
  const { isPassportFlowEnabled } = useDashboardStore();
  const [isPassportBannerDismissed, setIsPassportBannerDismissed] = useLocalStorage(
    'isPassportWaitlistBannerDismissed',
    false,
  );
  const [hideArrow, setHideArrow] = useState(false);
  const ref = useRef(null);
  const bodyContent = condense ? textMap.short : textMap.long;

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.contentRect.width <= 760) {
        setHideArrow(true);
      } else {
        setHideArrow(false);
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, [ref]);

  if ((!condense && isPassportBannerDismissed) || isPassportFlowEnabled) {
    return null;
  }

  return (
    <HStack
      ref={ref}
      px={condense ? 5 : 4}
      py={4}
      rounded={condense ? 'xl' : '2xl'}
      backdropFilter="blur(8px)"
      justify="space-between"
      style={{
        backgroundImage: `radial-gradient(${condense ? '182.15% 199.38%' : '202.7% 145.15%'} at 100% 100%, #000 0%, rgba(0, 0, 0, 0.50) 100%)`,
      }}
    >
      <a href="https://magic.link/#passport" target="_blank" rel="noopener noreferrer" className={hstack()}>
        {!condense && (
          <IcoMegaphone width={24} height={24} color={token('colors.paper')} className={css({ minW: 6 })} />
        )}
        <Text size={condense ? 'sm' : 'md'} styles={{ color: token('colors.paper') }}>
          {bodyContent}
        </Text>
        <IcoArrowRight
          width={16}
          height={16}
          color={token('colors.paper')}
          className={css({
            minW: 4,
            display: !condense && hideArrow ? 'none' : 'inline',
          })}
        />
      </a>

      {!condense && (
        <ButtonContainer onPress={() => setIsPassportBannerDismissed(true)}>
          <IcoDismiss width={16} height={16} color={token('colors.paper')} />
        </ButtonContainer>
      )}
    </HStack>
  );
};
