import { Button, IcoDismiss } from '@magiclabs/ui-components';

interface CloseButtonProps {
  onClick: () => void;
  background?: boolean;
}

export const CloseButton = ({ onClick, background = true }: CloseButtonProps) => {
  return (
    <Button aria-label="Exit" size="sm" variant={background ? 'neutral' : 'transparent'} onPress={onClick}>
      <Button.TrailingIcon>
        <IcoDismiss />
      </Button.TrailingIcon>
    </Button>
  );
};
