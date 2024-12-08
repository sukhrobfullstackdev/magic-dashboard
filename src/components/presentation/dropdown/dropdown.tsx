import { useKeyDown } from '@hooks/common/use-keydown';
import { Card } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box } from '@styled/jsx';
import { useClickAway } from '@uidotdev/usehooks';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { usePopper } from 'react-popper';

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  button: JSX.Element;
  opened?: boolean;
  setOpened?: (v: boolean) => void;
  placement?: 'left' | 'right';
  paddingType?: 'none' | 'sm' | 'md' | 'lg';
}

type UncontrolledComp = Omit<DropdownProps, 'opened' | 'setOpened'>;

type ControlledComp = Omit<DropdownProps, 'opened' | 'setOpened'> & {
  opened: boolean;
  setOpened: (v: boolean) => void;
};

const Uncontrolled = ({ children, button, ...rest }: UncontrolledComp) => {
  const [isVisible, setVisible] = useState(false);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useClickAway<HTMLDivElement>(() => setVisible(false));
  const { styles, attributes } = usePopper(ref.current, popperElement, {
    placement: 'bottom-start',
  });

  return (
    <Box {...rest} ref={containerRef}>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setVisible(!isVisible)}
        ref={ref}
        onKeyDown={useKeyDown(() => setVisible(!isVisible), ['Enter'])}
      >
        {button}
      </Box>

      {isVisible && (
        <Box
          p={3}
          bg="surface.primary"
          rounded="xl"
          zIndex={2}
          boxShadow="4px 8px 20px rgba(0, 0, 0, 0.15)"
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

const Controlled = ({
  button,
  children,
  opened,
  setOpened,
  placement = 'left',
  style,
  paddingType = 'sm',
  ...rest
}: ControlledComp) => {
  const containerRef = useClickAway<HTMLDivElement>(() => setOpened(false));

  return (
    <Box
      position="relative"
      style={{
        ...style,
      }}
      {...rest}
      ref={containerRef}
    >
      <Box
        role="button"
        zIndex={993}
        cursor="pointer"
        tabIndex={0}
        onClick={() => setOpened(!opened)}
        onKeyDown={useKeyDown(() => setOpened(!opened), ['Enter'])}
      >
        {button}
      </Box>

      <AnimatePresence mode="wait">
        {opened && (
          <motion.div
            initial={{
              y: 10,
              opacity: 0,
            }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={css({
              position: 'absolute',
              top: 'calc(100% + 8px)',
              boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: 'xl',
              zIndex: 994,
              ...(placement === 'left' ? { left: 0 } : { right: 0 }),
            })}
          >
            <Card paddingType={paddingType}>{children}</Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export const Dropdown = ({ opened, setOpened, ...rest }: DropdownProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Box />;
  }

  if (typeof opened !== 'undefined' && typeof setOpened === 'function') {
    return <Controlled opened={opened} setOpened={setOpened} {...rest} />;
  } else {
    return <Uncontrolled {...rest} />;
  }
};
