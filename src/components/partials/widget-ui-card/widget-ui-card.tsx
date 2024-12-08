import { ImageCarousel } from '@components/partials/image-carousel';
import { FeatureToggleCard } from '@components/partials/widget-ui-card/feature-toggle-card';
import { IcoCheckmark, IcoOpenBook, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, Divider, HStack, Stack } from '@styled/jsx';
import { circle } from '@styled/patterns';
import { token } from '@styled/tokens';
import { useMemo, type ReactNode } from 'react';

type SubFeature = {
  label: string;
  description: string | ReactNode;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  children?: React.JSX.Element;
};

interface WidgetUICardProps {
  title: string;
  descriptions: string[];
  rightIcon?: ReactNode;
  docsLink: string;
  carouselImgList: {
    path: string;
    alt: string;
  }[];
  subFeatures?: SubFeature[];
  callout?: ReactNode;
}

export const WidgetUICard = ({
  title,
  descriptions,
  rightIcon,
  docsLink,
  carouselImgList,
  subFeatures = [],
  callout,
}: WidgetUICardProps) => {
  const imgList = useMemo(
    () =>
      carouselImgList.map((url) => {
        return (
          <Box key={url.path}>
            {/* skipcq: JS-W1015 */}
            <img className={css({ rounded: '3xl' })} id={url.alt} src={url.path} alt={url.alt} />
          </Box>
        );
      }),
    [carouselImgList],
  );

  return (
    <Stack
      justifyContent="space-between"
      px={10}
      py={6}
      gap={6}
      rounded="2xl"
      bg="neutral.quaternary"
      smDown={{ p: 0 }}
      key={title}
    >
      <Stack gap={4} justifyContent="space-between">
        <Stack gap={3}>
          <Center>
            <Text
              size="xs"
              fontWeight="semibold"
              styles={{ color: token('colors.neutral.primary'), textTransform: 'uppercase' }}
            >
              Example UI
            </Text>
          </Center>
          <ImageCarousel>{imgList}</ImageCarousel>
        </Stack>

        <HStack gap={0} justifyContent="space-between">
          <HStack gap={2}>
            <Text size="lg" fontWeight="semibold">
              {title}
            </Text>
            <a
              href={docsLink}
              rel="noreferrer"
              target="_blank"
              className={circle({ p: 1, bg: 'transparent', _hover: { bg: 'neutral.tertiary' } })}
            >
              <IcoOpenBook width={15} height={15} color={token('colors.text.secondary')} />
            </a>
          </HStack>
          {rightIcon && rightIcon}
        </HStack>

        <Divider color="neutral.secondary" />

        <Stack gap={4}>
          {descriptions.map((feature) => {
            return (
              <HStack gap={4} key={feature}>
                <IcoCheckmark width={16} height={16} color={token('colors.brand.lighter')} />
                <Text size="sm">
                  {feature.includes('view compatibility') ? (
                    <span>
                      {feature.split('view compatibility')[0]}
                      <a
                        href="https://magic.link/docs/wallets/customization/widget-ui#overview"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        view compatibility
                      </a>
                      {feature.split('view compatibility')[1]}
                    </span>
                  ) : (
                    feature
                  )}
                </Text>
              </HStack>
            );
          })}
        </Stack>

        <Stack gap={4}>
          {subFeatures.map((feature) => (
            <FeatureToggleCard key={feature.label} {...feature} />
          ))}
          {callout}
        </Stack>
      </Stack>
    </Stack>
  );
};
