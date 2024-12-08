import { Button, IcoCheckmark } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { type ComponentProps } from 'react';

type Props = {
  onPress: ComponentProps<typeof Button>['onPress'];
  text: string;
};

export const CallToActionWithCheck = ({ onPress, text }: Props) => (
  <Box>
    <Button size="sm" label={text} onPress={onPress}>
      <Button.LeadingIcon>
        <IcoCheckmark />
      </Button.LeadingIcon>
    </Button>
  </Box>
);
