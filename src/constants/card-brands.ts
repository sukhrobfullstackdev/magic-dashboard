import { PaymentCardLogos } from '@constants/paymentCardInfo';

export const CARD_BRANDS = {
  ALIPAY: 'alipay',
  CODE: 'c[ode',
  ELO: 'elo',
  VISA: 'visa',
  PAYPAL: 'paypal',
  MASTERCARD: 'mastercard',
  GENERIC: 'generic',
  HIPER: 'hiper',
  HIPERCARD: 'hipercard',
  MAESTRO: 'maestro',
  MIR: 'mir',
  AMEX: 'amex',
  DISCOVER: 'discover',
  DINERS: 'diners',
  JCB: 'jcb',
  UNIONPAY: 'unionpay',
} as const;

export const CARD_BRAND_LOGOS = {
  [CARD_BRANDS.ALIPAY]: PaymentCardLogos.alipay,
  [CARD_BRANDS.CODE]: PaymentCardLogos.code,
  [CARD_BRANDS.ELO]: PaymentCardLogos.elo,
  [CARD_BRANDS.VISA]: PaymentCardLogos.visa,
  [CARD_BRANDS.PAYPAL]: PaymentCardLogos.paypal,
  [CARD_BRANDS.MASTERCARD]: PaymentCardLogos.mastercard,
  [CARD_BRANDS.GENERIC]: PaymentCardLogos.generic,
  [CARD_BRANDS.HIPER]: PaymentCardLogos.hiper,
  [CARD_BRANDS.HIPERCARD]: PaymentCardLogos.hipercard,
  [CARD_BRANDS.MAESTRO]: PaymentCardLogos.maestro,
  [CARD_BRANDS.MIR]: PaymentCardLogos.mir,
  [CARD_BRANDS.AMEX]: PaymentCardLogos.amex,
  [CARD_BRANDS.DISCOVER]: PaymentCardLogos.discover,
  [CARD_BRANDS.DINERS]: PaymentCardLogos.diners,
  [CARD_BRANDS.JCB]: PaymentCardLogos.jcb,
  [CARD_BRANDS.UNIONPAY]: PaymentCardLogos.unionpay,
} as const;
