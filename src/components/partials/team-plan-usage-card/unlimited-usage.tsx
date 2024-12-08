import { Text } from '@magiclabs/ui-components';
import { Grid } from '@styled/jsx';

type Props = {
  mauUsed: number;
  smsUsed: number;
};

export const UnlimitedUsage = ({ mauUsed, smsUsed }: Props) => {
  return (
    <Grid columns={2}>
      <Text size="sm" fontColor="text.tertiary">
        <Text inline fontColor="text.primary" fontWeight="bold" styles={{ fontSize: '20px' }}>
          {mauUsed.toLocaleString()}
        </Text>{' '}
        total active users
      </Text>
      <Text size="sm" fontColor="text.tertiary">
        <Text inline fontColor="text.primary" fontWeight="bold" styles={{ fontSize: '20px' }}>
          {smsUsed.toLocaleString()}
        </Text>{' '}
        total text messages sent
      </Text>
    </Grid>
  );
};
