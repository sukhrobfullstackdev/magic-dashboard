import { IcoQuestionCircleFill, Text, TextInput, Tooltip } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';

type UrlInputProps = {
  label: string;
  value: string;
  tooltip: string;
  setUrl: (url: string) => void;
  errorMessage: string;
  setErrorMessage: (errorMessage: string) => void;
};

export const UrlInput = ({ label, value, tooltip, setUrl, errorMessage, setErrorMessage }: UrlInputProps) => {
  const handleChange = (url: string) => {
    if (errorMessage) {
      setErrorMessage('');
    }

    setUrl(url);
  };

  return (
    <Stack>
      <HStack gap={2} w="full">
        <Text size="sm" fontWeight="medium">
          {label}
        </Text>
        <Tooltip
          content={
            <Text inline fontColor="text.tertiary" size="xs">
              {tooltip}
            </Text>
          }
        >
          <IcoQuestionCircleFill color={token('colors.neutral.primary')} height="0.75rem" width="0.75rem" />
        </Tooltip>
      </HStack>
      <TextInput
        value={value}
        placeholder="URL"
        aria-label={`add ${label}`}
        onChange={handleChange}
        errorMessage={errorMessage}
      />
    </Stack>
  );
};
