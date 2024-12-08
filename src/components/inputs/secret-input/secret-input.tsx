import { IcoEyeClosed, IcoEyeOpened, TextInput } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { useCallback, useState } from 'react';

interface SecretInputProps {
  disabled?: boolean;
  errorMessage?: string;
  onChange: (text: string) => void;
  value: string;
  label?: string;
  placeholder?: string;
}

export const SecretInput = (props: SecretInputProps) => {
  const { errorMessage = '', disabled = false, value, onChange, label, placeholder } = props;

  const [hidden, setHidden] = useState(true);

  const toggleHidden = useCallback(() => {
    setHidden(!hidden);
  }, [hidden]);

  return (
    <Box pos="relative">
      <TextInput
        placeholder={placeholder}
        label={label}
        onChange={onChange}
        value={value}
        aria-label="client secret"
        disabled={disabled}
        attr={{ type: hidden ? 'password' : 'text' }}
        errorMessage={errorMessage}
      >
        <TextInput.ActionIcon onClick={toggleHidden}>
          {hidden ? <IcoEyeOpened /> : <IcoEyeClosed />}
        </TextInput.ActionIcon>
      </TextInput>
    </Box>
  );
};
