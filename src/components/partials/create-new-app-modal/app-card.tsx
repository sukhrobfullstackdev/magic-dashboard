import { Chip } from '@components/presentation/chip';
import { APP_LABEL, AppType, PASSPORT_APP } from '@constants/appInfo';
import { useKeyDown } from '@hooks/common/use-keydown';
import { IcoCheckmark, Text } from '@magiclabs/ui-components';
import { Box, Circle, HStack, Stack } from '@styled/jsx';
import { hstack, stack } from '@styled/patterns';
import { token } from '@styled/tokens';

const renderDescriptionLiItem = (text: string, idx: number) => (
  <li key={idx} className={hstack({ gap: 2 })}>
    <IcoCheckmark width={16} height={16} color={token('colors.brand.base')} />
    <Text styles={{ color: token('colors.text.tertiary') }}>{text}</Text>
  </li>
);

export const renderNewAppSelectCard = (
  selectedAppType: AppType,
  appType: AppType,
  description: string,
  onSelect: () => void,
  isWelcomeView?: boolean,
) => {
  const Logo = APP_LABEL[appType].Logo;
  return (
    <HStack
      gap={4}
      px={6}
      py={isWelcomeView ? 8 : 6}
      borderWidth="thick"
      borderColor={selectedAppType === appType ? 'brand.base' : 'neutral.tertiary'}
      rounded="2xl"
      cursor="pointer"
      transition="background-color 0.1s ease"
      _hover={{ ...(selectedAppType !== appType ? { bg: 'neutral.quaternary' } : {}) }}
      role="button"
      onClick={() => onSelect()}
      tabIndex={0}
    >
      <Stack gap={isWelcomeView ? 5 : 3} justifyContent="space-between">
        <HStack>
          {isWelcomeView ? (
            <Text.H4 fontWeight="semibold">{APP_LABEL[appType][appType === PASSPORT_APP ? 'short' : 'long']}</Text.H4>
          ) : (
            <Text fontWeight="semibold">{APP_LABEL[appType].short}</Text>
          )}
          {appType === PASSPORT_APP && (
            <Chip sizeVariant="small">
              <Text inline size="xs" fontWeight="semibold" styles={{ color: token('colors.brand.darker') }}>
                FREE
              </Text>
            </Chip>
          )}
        </HStack>
        <Text size={isWelcomeView ? 'md' : 'sm'} fontColor="text.secondary">
          {description}
        </Text>
      </Stack>

      <Box>
        <Logo width={isWelcomeView ? 44 : 48} height={isWelcomeView ? 44 : 48} />
      </Box>
    </HStack>
  );
};

export const renderAppSelectCard = (
  selectedAppType: AppType,
  appType: AppType,
  descriptions: string[],
  onSelect: () => void,
) => {
  const Logo = APP_LABEL[appType].Logo;
  return (
    <Stack
      gap={4}
      p={6}
      borderWidth="thick"
      borderColor={selectedAppType === appType ? 'brand.base' : 'neutral.tertiary'}
      rounded="2xl"
      cursor="pointer"
      role="button"
      onClick={() => onSelect()}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      onKeyDown={useKeyDown(() => onSelect(), ['Enter'])}
      tabIndex={0}
    >
      <HStack justifyContent="space-between">
        <Text fontWeight="semibold">{APP_LABEL[appType].long}</Text>
        <Circle p={2} style={{ backgroundColor: APP_LABEL[appType].bgColor }}>
          <Logo width={18} height={18} color={APP_LABEL[appType].color} />
        </Circle>
      </HStack>

      <ul className={stack({ gap: 2 })}>{descriptions.map(renderDescriptionLiItem)}</ul>
    </Stack>
  );
};
