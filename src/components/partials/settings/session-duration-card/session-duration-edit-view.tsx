import { DropdownOption, DropdownSelector, IcoShield, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState } from 'react';

const customSessionDurationOptions = [
  { label: '7 days', value: '7' },
  { label: '14 days', value: '14' },
  { label: '30 days', value: '30' },
  { label: '60 days', value: '60' },
  { label: '90 days', value: '90' },
  { label: 'Custom', value: 'custom' },
];

export const defaultSessionDurationOption = 7;
export const maxSessionDuration = 90;
export const minSessionDuration = 7;

type Props = {
  setCustomSessionLengthDays: (val: string) => void;
  customSessionLengthDays: string;
};

export const SessionDurationEditView = ({ setCustomSessionLengthDays, customSessionLengthDays }: Props) => {
  const [sessionRefreshOption, setSessionRefreshOption] = useState<string>(
    customSessionDurationOptions.find((option) => option.value === `${customSessionLengthDays}`)?.value || 'custom',
  );
  const showSessionDurationInput = sessionRefreshOption === 'custom';

  const onSesionRefreshOptionChange = (val: string) => {
    setSessionRefreshOption(val);
    setCustomSessionLengthDays(val);
  };

  const isLessThanMin = !customSessionLengthDays || +customSessionLengthDays < minSessionDuration;
  const isOutOfRange = +customSessionLengthDays > maxSessionDuration;
  let customSessionLengthValidationMsg = '';

  if (isLessThanMin || isOutOfRange) {
    customSessionLengthValidationMsg = 'Must be between 1 and 90 days';
  }

  const sessionRefreshSection = (
    <Stack mb={8} gap={8}>
      <Text fontColor="text.tertiary">
        Persistent sessions up to 90 days, using Magic refresh tokens. <br />
        An optimal UX and ideal for privacy-first browsers.
      </Text>

      <Flex gap={4} justifyContent="space-between">
        <Box flex={1}>
          <DropdownSelector
            onSelect={onSesionRefreshOptionChange}
            selectedValue={sessionRefreshOption}
            label="Require users to login every"
            aria-label="session-length-select"
            viewMax={6}
            size="md"
          >
            {customSessionDurationOptions.map((option) => (
              <DropdownOption key={option.value} label={option.label} value={option.value} />
            ))}
          </DropdownSelector>
        </Box>
        {showSessionDurationInput ? (
          <Box flex={1}>
            <TextInput
              label="Custom session length"
              value={
                customSessionLengthDays === 'custom' ? String(defaultSessionDurationOption) : customSessionLengthDays
              }
              type="number"
              onChange={setCustomSessionLengthDays}
              errorMessage={customSessionLengthValidationMsg}
            >
              <TextInput.Suffix>Days</TextInput.Suffix>
            </TextInput>
          </Box>
        ) : (
          <Box flex={1} />
        )}
      </Flex>

      <HStack>
        <IcoShield color={token('colors.brand.base')} />
        <Text>
          We recommend reviewing{' '}
          <a
            className={css({ color: 'brand.base', fontWeight: 600 })}
            rel="noreferrer"
            target="_blank"
            href="https://magic.link/docs/introduction/faq#refresh-token-security"
          >
            security best practices
          </a>{' '}
          to guard against cross-site scripting
        </Text>
      </HStack>
    </Stack>
  );

  return <Box>{sessionRefreshSection}</Box>;
};
