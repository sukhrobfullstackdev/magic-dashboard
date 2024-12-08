import { clipboard } from '@libs/copy';
import { Button, IcoCheckmark, IcoCopy } from '@magiclabs/ui-components';
import { useCallback, useState } from 'react';

interface CopyIconProps {
  value?: string;
  onCopy?: () => void;
}

export const CopyIcon = ({ value, onCopy }: CopyIconProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (copied) return;
    clipboard.writeText(value);
    setCopied(true);
    onCopy?.();
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [value]);

  return (
    <Button variant="text" onPress={handleCopy}>
      <Button.LeadingIcon>{!copied ? <IcoCopy /> : <IcoCheckmark />}</Button.LeadingIcon>
    </Button>
  );
};

export const CircleCopyIcon = ({ value, onCopy }: CopyIconProps) => {
  const [copied, setCopied] = useState(false);

  const onClickHandler = useCallback(() => {
    if (copied) return;
    clipboard.writeText(value);
    setCopied(true);
    onCopy?.();
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, []);

  return (
    <Button size="sm" variant="transparent" onPress={onClickHandler}>
      <Button.LeadingIcon>
        {!copied ? <IcoCopy width={18} height={18} /> : <IcoCheckmark width={18} height={18} />}
      </Button.LeadingIcon>
    </Button>
  );
};
