import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  type CardCvcElementProps,
  type CardExpiryElementProps,
  type CardNumberElementProps,
} from '@stripe/react-stripe-js';
import { css, cx } from '@styled/css';
import { token } from '@styled/tokens';
import { forwardRef, type ComponentProps } from 'react';

// TODO: Follow up to account for dark mode. It currently doesn't work due to semantic tokens returning CSS variables.
const stripeStyle = {
  style: {
    base: {
      color: token('colors.ink.90'),
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: token('colors.ink.70'),
      },
    },
    invalid: {
      color: token('colors.ruby.70'),
      iconColor: token('colors.ruby.70'),
    },
  },
};

const stripePandaStyles = css({
  px: 3,
  py: 3.5,
  rounded: 'input',
  borderWidth: 'thin',
  borderColor: 'neutral.secondary',
  color: 'text.primary',
  boxSizing: 'border-box',
  w: 'full',
  fontSize: '1rem',
  _placeholder: {
    color: 'text.tertiary',
  },
});

export const StripeCardNumberInput = (props: CardNumberElementProps) => {
  return (
    <CardNumberElement
      id="card-number-element"
      className={stripePandaStyles}
      options={{
        ...stripeStyle,
        showIcon: true,
      }}
      {...props}
    />
  );
};

export const StripeCvcInput = (props: CardCvcElementProps) => {
  return (
    <CardCvcElement
      className={stripePandaStyles}
      options={{
        ...stripeStyle,
      }}
      {...props}
    />
  );
};

export const StripeExpiryInput = (props: CardExpiryElementProps) => {
  return (
    <CardExpiryElement
      className={stripePandaStyles}
      options={{
        ...stripeStyle,
      }}
      {...props}
    />
  );
};

export const StripeInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>((props, ref) => {
  return <input ref={ref} className={cx(stripePandaStyles, css({ h: '50px' }))} {...props} />;
});

StripeInput.displayName = 'StripeInput';
