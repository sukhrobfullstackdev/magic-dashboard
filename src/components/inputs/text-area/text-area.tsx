import { Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Flex, Stack } from '@styled/jsx';
import { noop } from '@tanstack/react-table';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps {
  disabled?: boolean;
  errorMessage?: string;
  hasAction?: boolean;
  actionLabel?: string;
  height?: string;
  actionHandler?: () => void;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical' | 'block' | 'inline';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & TextAreaProps>(
  (props, externalRef) => {
    const {
      errorMessage = '',
      height = '175px',
      disabled = false,
      hasAction = false,
      actionLabel = '',
      actionHandler = noop,
      resize = 'none',
      ...otherProps
    } = props;

    return (
      <Stack gap={1.5} position="relative">
        <Flex w="full">
          <textarea
            disabled={disabled}
            style={{ height, resize }}
            className={css({
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              w: 'full',
              p: 3,
              overflowX: 'hidden',
              cursor: 'auto',
              borderWidth: 'thin',
              borderColor: errorMessage ? 'negative.darker' : 'neutral.secondary',
              roundedLeft: 'lg',
              roundedRight: hasAction ? 0 : 'lg',
              outline: 'none',
              _placeholder: {
                color: 'text.tertiary',
              },
              _disabled: {
                opacity: 0.3,
                pointerEvents: 'none',
              },
              _hover: {
                borderColor: 'neutral.primary',
              },
            })}
            {...otherProps}
            ref={externalRef}
          />

          {hasAction && (
            <button
              disabled={disabled}
              className={css({
                cursor: 'pointer',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                px: 3.5,
                transition: 'all 0.2s',
                zIndex: 0,
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'brand.base',
                bg: 'neutral.quaternary',
                borderWidth: 'thin',
                borderLeftWidth: 0,
                borderColor: 'neutral.secondary',
                roundedTopRight: 'lg',
                roundedBottomRight: 'lg',
                _hover: {
                  bg: 'neutral.tertiary',
                  borderColor: 'neutral.primary',
                },
                _disabled: {
                  opacity: 0.3,
                  pointerEvents: 'none',
                },
              })}
              onClick={actionHandler}
            >
              {actionLabel}
            </button>
          )}
        </Flex>
        {Boolean(errorMessage) && (
          <Box>
            <Text variant="error" size="sm">
              {errorMessage}
            </Text>
          </Box>
        )}
      </Stack>
    );
  },
);

TextArea.displayName = 'TextArea';
