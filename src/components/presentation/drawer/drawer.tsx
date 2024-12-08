import { Button } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box } from '@styled/jsx';
import { useClickAway } from '@uidotdev/usehooks';
import { AnimatePresence, motion } from 'framer-motion';
import { type HTMLAttributes } from 'react';

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  buttonIcon: JSX.Element;
  opened: boolean;
  setOpened: (v: boolean) => void;
}

export const Drawer = ({ buttonIcon, children, opened, setOpened, ...rest }: DrawerProps) => {
  const ref = useClickAway<HTMLDivElement>(() => setOpened(false));

  return (
    <Box position="relative" zIndex={100} {...rest} ref={ref}>
      <Button variant="neutral" size="sm" onPress={() => setOpened(!opened)}>
        <Button.LeadingIcon>{buttonIcon}</Button.LeadingIcon>
      </Button>

      <AnimatePresence mode="wait">
        {opened && (
          <motion.div
            initial={{
              x: -10,
              opacity: 0,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            className={css({
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              bg: 'surface.primary',
              boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.15)',
            })}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
