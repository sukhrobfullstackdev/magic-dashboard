import { IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { ElementType, type HTMLProps, type ReactNode } from 'react';

export const SelectableCard = ({
  banner = null,
  Icon = undefined,
  label = undefined,
  title,
  titleTooltip,
  subtitle,
  isSelected,
  isDisabled,
  children,
  imgUrl = undefined,
  ...rest
}: {
  banner?: ReactNode;
  Icon?: ElementType;
  label?: string;
  title?: string;
  titleTooltip?: string;
  subtitle?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  imgUrl?: string;
} & HTMLProps<HTMLDivElement>) => {
  const iconFill = isSelected ? 'colors.brand.base' : 'colors.neutral.primary';

  return (
    <div
      {...rest}
      className={css({
        p: isSelected ? '1.4375rem' : 6,
        w: '21.25rem',
        bg: 'surface.primary',
        borderWidth: isSelected ? 'thick' : 'thin',
        borderColor: isSelected ? 'brand.base' : 'neutral.secondary',
        rounded: 'xl',
        cursor: 'pointer',
        transition: 'box-shadow linear 300ms',
        boxSizing: 'border-box',
        flexGrow: 1,
        _hover: {
          boxShadow: '0px 2px 24px 1px rgba(78, 77, 82, 0.08)',
        },
        _disabled: {
          opacity: 0.3,
          pointerEvents: 'none',
        },
      })}
      data-disabled={isDisabled}
    >
      {banner && <Box mb={4}>{banner}</Box>}
      {(Icon || label) && (
        <HStack h={5} justifyContent="space-between" mb={4}>
          {Icon && <Icon color={token(iconFill)} />}
          {label && (
            <Center bg="brand.lightest" px={2} py={1} rounded="md">
              <Text size="sm" fontWeight="semibold" variant="info" styles={{ textTransform: 'uppercase' }}>
                {label}
              </Text>
            </Center>
          )}
        </HStack>
      )}
      {imgUrl && (
        <HStack h={5} justifyContent="space-between" mb="1.125rem">
          {/* skipcq: JS-W1015 */}
          <img src={imgUrl} width={34} height={34} alt="app logo" />
        </HStack>
      )}
      {(title || titleTooltip) && (
        <>
          <HStack gap={3}>
            <Text size="lg" fontWeight="semibold">
              {title}
            </Text>
            {titleTooltip && (
              <Tooltip
                width={260}
                content={
                  <Text inline size="sm" fontColor="text.tertiary">
                    {titleTooltip}
                  </Text>
                }
              >
                <IcoQuestionCircleFill color={token('colors.neutral.primary')} height={18} width={18} />
              </Tooltip>
            )}
          </HStack>
          {subtitle && (
            <Box mt={2}>
              <Text>{subtitle}</Text>
            </Box>
          )}
        </>
      )}
      {children && <Box mt={4}>{children}</Box>}
    </div>
  );
};
