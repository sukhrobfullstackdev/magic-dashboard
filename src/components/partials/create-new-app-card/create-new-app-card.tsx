import { Button, IcoDedicated, IcoDismiss, IcoPassport, Text } from '@magiclabs/ui-components';
import { Box, Flex, HStack, VStack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import { token } from '@styled/tokens';

const CARD_CONTENT: {
  [key: string]: {
    title: string;
    buttonText: string;
    imgUrl: string;
    buttonIcon: JSX.Element;
    altText: string;
  };
} = {
  passport: {
    title: 'Looking for full end-to-end customization?',
    buttonText: 'Try Dedicated Wallet',
    imgUrl: '/images/embedded-wallet.png',
    buttonIcon: <IcoDedicated color={token('colors.paper')} width={20} height={20} />,
    altText: 'embedded-wallet-image',
  },
  auth: {
    title: 'Looking for instant multi-chain wallets?',
    buttonText: 'Try Passport Wallet',
    imgUrl: '/images/passport.png',
    buttonIcon: <IcoPassport color={token('colors.paper')} width={20} height={20} />,
    altText: 'passport-image',
  },
  embedded: {
    title: 'Looking for instant multi-chain wallets?',
    buttonText: 'Try Passport Wallet',
    imgUrl: '/images/passport.png',
    buttonIcon: <IcoPassport color={token('colors.paper')} width={20} height={20} />,
    altText: 'passport-image',
  },
};

type CreateNewAppCardProps = {
  appType: string;
  appId: string;
};

const CreateNewAppCard = ({ appType, appId }: CreateNewAppCardProps) => {
  // TODO: Update once backend has check for dismiss card
  const handleDismiss = () => {
    return appId;
  };

  if (!CARD_CONTENT[appType]) return null;

  return (
    <HStack
      h="200px"
      px={8}
      py={5}
      gap="6.25rem"
      position="relative"
      bg="ink.20"
      rounded="2xl"
      lgDown={{ gap: 4 }}
      smDown={{ gap: 0 }}
    >
      <VStack alignItems="flex-start" gap={10} maxW="340px" smDown={{ gap: 4 }}>
        <Text.H4 styles={{ fontWeight: 600, textWrap: 'wrap' }}>{CARD_CONTENT[appType]?.title}</Text.H4>
        <button
          className={hstack({
            px: '4 !important',
            py: '1.5 !important',
            gap: 2,
            bg: 'ink.90',
            rounded: 'button',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
            willChange: 'transform',
            _hover: {
              bg: 'ink.80',
            },
            _active: { transform: 'scale(0.95)' },
          })}
        >
          {CARD_CONTENT[appType].buttonIcon}
          <Text size="sm" styles={{ fontWeight: 600, color: token('colors.paper') }}>
            {CARD_CONTENT[appType].buttonText}
          </Text>
        </button>
      </VStack>
      <Flex justifyContent="flex-start" h="auto" w="239px">
        <img src={CARD_CONTENT[appType].imgUrl} alt={CARD_CONTENT[appType].altText} />
      </Flex>
      <Box position="absolute" right={4} top={4}>
        <Button size="sm" variant="neutral" onPress={handleDismiss} aria-label="dismiss">
          <Button.LeadingIcon>
            <IcoDismiss />
          </Button.LeadingIcon>
        </Button>
      </Box>
    </HStack>
  );
};

export default CreateNewAppCard;
