import { IcoArrowRight, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import Link from 'next/link';

export const FreeOnlyUpsellBanner = ({ className, textColor, ...rest }: { className: string; textColor: string }) => {
  return (
    <Link href="/checkout/get-started-with-free" shallow>
      <HStack
        role="button"
        alignItems="center"
        justifyContent="space-between"
        p="8px 12px"
        borderRadius="10px"
        cursor="pointer"
        className={className}
        {...rest}
      >
        <Text size="sm" styles={{ color: textColor }}>
          <Text inline fontWeight="semibold" styles={{ color: textColor }}>
            Upgrade your plan
          </Text>{' '}
          to get unlimited monthly active users and text messages
        </Text>

        <IcoArrowRight color={textColor} />
      </HStack>
    </Link>
  );
};
