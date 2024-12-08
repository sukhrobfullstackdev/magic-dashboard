import * as SheetPrimitive from '@radix-ui/react-dialog';
import { css, cx } from '@styled/css';
import * as React from 'react';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cx(
      css({
        pos: 'fixed',
        inset: 0,
        bgColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 'max',
        "&[data-state='open']": {
          animation: 'fadeIn 0.5s',
        },
        "&[data-state='closed']": {
          animation: 'fadeOut 0.5s',
        },
      }),
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
SheetOverlay.propTypes = SheetPrimitive.Overlay.propTypes;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cx(
          css({
            pos: 'fixed',
            boxShadow: '0px 12px 56px 0px rgba(119, 118, 122, 0.15)',
            top: 6,
            bottom: 6,
            right: 6,
            w: '520px',
            rounded: '3xl',
            zIndex: 'max',
            bgColor: 'surface.primary',
            "&[data-state='open']": {
              animation: 'slideInX 300ms',
            },
            "&[data-state='closed']": {
              animation: 'slideOutX 300ms',
            },
          }),
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetTrigger };
