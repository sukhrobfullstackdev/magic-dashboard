import { CARD_BRANDS, CARD_BRAND_LOGOS } from '@constants/paymentCardInfo';
import Image from 'next/image';

type CardBrand = keyof typeof CARD_BRAND_LOGOS;

export const CardBrandLogo = ({ cardBrand }: { cardBrand: CardBrand }) => {
  return (
    <Image src={CARD_BRAND_LOGOS[cardBrand] || CARD_BRAND_LOGOS[CARD_BRANDS.GENERIC]} alt="" width={32} height={20} />
  );
};
