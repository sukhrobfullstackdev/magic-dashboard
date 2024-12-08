import { CustomSmtpInfo } from '@hooks/data/custom-smtp/types';
import { Text } from '@magiclabs/ui-components';
import { Grid, Stack } from '@styled/jsx';

type Props = {
  customSmtpInfo: CustomSmtpInfo;
};

export const CustomSmtpInfoReadOnly = ({ customSmtpInfo }: Props) => {
  const data = [
    { label: 'Sender email', value: customSmtpInfo.senderEmail },
    { label: 'Sender name', value: customSmtpInfo.senderName },
    { label: 'Host', value: customSmtpInfo.host },
    { label: 'Port', value: customSmtpInfo.port },
    { label: 'User name', value: customSmtpInfo.userName },
    { label: 'Password', value: '••••••••' },
  ];

  return (
    <Grid gridTemplateColumns="1fr 1fr" gap={5}>
      {data.map((v) => (
        <Stack gap={3} key={v.label}>
          <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
            {v.label}
          </Text>
          <Text>{v.value}</Text>
        </Stack>
      ))}
    </Grid>
  );
};
