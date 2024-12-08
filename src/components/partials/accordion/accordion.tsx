import { IcoCaretDown } from '@magiclabs/ui-components';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { css, cx } from '@styled/css';
import { hstack } from '@styled/patterns';
import * as React from 'react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cx(css({ borderBottomWidth: 'thin' }), className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';
AccordionItem.propTypes = AccordionPrimitive.Item.propTypes;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className={css({ display: 'flex' })}>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cx(
        hstack({
          justifyContent: 'space-between',
          flex: 1,
          fontSize: 'sm',
          fontWeight: 'medium',
          lineHeight: '1.25rem',
          transitionProperty: 'all',
          transitionDuration: '0.2s',
          cursor: 'pointer',
          _hover: {
            textDecoration: 'underline',
          },
        }),
        className,
      )}
      {...props}
    >
      {children}
      <IcoCaretDown width={14} height={14} />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
AccordionTrigger.propTypes = AccordionPrimitive.Trigger.propTypes;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cx(
      css({
        overflow: 'hidden',
        fontSize: 'sm',
        transitionProperty: 'all',
        "&[data-state='closed']": { animation: 'accordionUp 200ms ease-out' },
        "&[data-state='open']": { animation: 'accordionDown 200ms ease-out' },
      }),
      className,
    )}
    {...props}
  >
    <div>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
AccordionContent.propTypes = AccordionPrimitive.Content.propTypes;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
