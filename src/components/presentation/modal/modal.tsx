import { useExpand, useFade } from '@components/hooks/transitions';
import { useKeyDown } from '@hooks/common/use-keydown';
import { Button, IcoDismiss } from '@magiclabs/ui-components';
import { css, cx } from '@styled/css';
import { Box, Center } from '@styled/jsx';
import { noop } from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps extends Pick<ComponentProps<'div'>, 'style'> {
  children: ReactNode;
  in?: boolean;
  mobileFullScreen?: boolean;
  className?: string;
  handleClose?: () => void;
  noPadding?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    { in: inProp, mobileFullScreen = true, noPadding = false, handleClose = noop, children, className = '', ...rest },
    ref,
  ) => {
    const getFadeProps = useFade();
    const getExpandProps = useExpand();
    const [el, setEl] = useState<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      portalRef.current = el;
    }, [el]);

    useEffect(() => {
      if (inProp) {
        if (!el) {
          const portalEl = document.createElement('div');
          portalEl.className = 'modal-portal';
          portalEl.id = 'modal-portal';
          document.body.appendChild(portalEl);
          setEl(portalEl);
        }

        document.body.classList.add('modal-open');
      }

      return () => {
        if (portalRef.current) {
          document.body.removeChild(portalRef.current);
        }

        setEl(null);

        document.body.classList.remove('modal-open');
      };
    }, [inProp]);

    if (el) {
      return createPortal(
        <AnimatePresence>
          {inProp && (
            <motion.div
              className={css({
                display: 'block',
                position: 'fixed',
                top: 0,
                right: 0,
                w: 'full',
                h: 'full',
                overflow: 'hidden',
                zIndex: 'max',
              })}
              {...getFadeProps()}
              ref={ref}
              {...rest}
            >
              <Box
                role="button"
                position="absolute"
                top={0}
                right={0}
                w="full"
                h="full"
                bg="surface.primary/70"
                zIndex={1}
                smDown={mobileFullScreen ? { pointerEvents: 'none', display: 'none' } : {}}
                onClick={handleClose}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                onKeyDown={useKeyDown(handleClose, ['Enter'])}
                tabIndex={0}
              />
              <Center
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={2}
                smDown={
                  mobileFullScreen
                    ? { display: 'block', position: 'static', w: 'full', h: 'full', transform: 'none' }
                    : {}
                }
              >
                <motion.div
                  className={cx(
                    css({
                      bg: 'surface.primary',
                      rounded: '2.5rem',
                      boxShadow: '0px 0px 30px #00000026',
                      w: '31.25rem',
                      p: noPadding ? 0 : 10,
                      mdDown: { rounded: '3xl' },
                    }),
                    mobileFullScreen && css({ smDown: { rounded: 0, w: 'full', h: 'full' } }),
                    className,
                  )}
                  {...getExpandProps()}
                >
                  {children}
                </motion.div>
              </Center>
            </motion.div>
          )}
        </AnimatePresence>,
        el,
      );
    }

    return null;
  },
);

Modal.displayName = 'Modal';

type Props = {
  disabled?: boolean;
  handleClose: () => void;
};

export const ModalCloseButton = ({ disabled = false, handleClose }: Props) => (
  <Box position="absolute" top={6} right={6}>
    <Button size="sm" variant="neutral" onPress={handleClose} disabled={disabled}>
      <Button.LeadingIcon>
        <IcoDismiss />
      </Button.LeadingIcon>
    </Button>
  </Box>
);
