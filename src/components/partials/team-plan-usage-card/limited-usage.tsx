import { ProgressBar } from '@components/presentation/progress-bar/progress-bar';
import { TOTAL_SMS_LIMIT } from '@constants/pricing';
import { Text } from '@magiclabs/ui-components';
import { Grid, Stack } from '@styled/jsx';

type Props = {
  mauUsed: number;
  smsUsed: number;
};

export const LimitedUsage = ({ mauUsed, smsUsed }: Props) => {
  return (
    <Grid columns={2}>
      <Stack gap={3} style={{ flex: 1 }}>
        <Text size="sm" fontColor="text.tertiary">
          <Text inline fontColor="text.primary" fontWeight="bold">
            {mauUsed.toLocaleString()}
          </Text>{' '}
          of 1,000 monthly active users
        </Text>
        <ProgressBar current={mauUsed} total={1000} />
      </Stack>
      <Stack gap={3} style={{ flex: 1 }}>
        <Text size="sm" fontColor="text.tertiary">
          <Text inline fontColor="text.primary" fontWeight="bold">
            {smsUsed.toLocaleString()}
          </Text>{' '}
          of {TOTAL_SMS_LIMIT.toLocaleString()} text messages sent
        </Text>
        <ProgressBar current={smsUsed} total={100} />
      </Stack>
    </Grid>
  );
};
