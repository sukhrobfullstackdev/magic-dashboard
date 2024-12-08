import { useTeamInvoicesSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Card, IcoDoc, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Grid, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';

const Fallback = () => {
  return (
    <Card className={css({ p: '30px' })}>
      <Text.H4 fontWeight="semibold">Invoices</Text.H4>
      <Skeleton className={css({ mt: 8 })} height={24} width={280} />
    </Card>
  );
};

const Resolved = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());

  const { data } = useTeamInvoicesSuspenseQuery(
    teamQueryKeys.invoices({
      teamId: userInfo.teamId,
    }),
  );

  return (
    <Card className={css({ p: '30px' })}>
      <Text.H4 fontWeight="semibold">Invoices</Text.H4>
      {data.invoices.length < 1 ? (
        <Box color="text.tertiary" mt={8}>
          New invoices will appear here on the first of each month
        </Box>
      ) : (
        <Box mt={8} overflowX={'auto'}>
          {data.invoices.map((invoice) => (
            <Grid
              columns={4}
              gap={2}
              key={invoice.month_year}
              minWidth={'550px'}
              p={'15px 0'}
              borderBottom={'1px solid'}
              borderColor={'neutral.tertiary'}
              css={{ _last: { borderBottomWidth: 0 } }}
            >
              <HStack gap={2}>
                <IcoDoc height={20} color={token('colors.neutral.primary')} />
                <Text>{invoice.month_year}</Text>
              </HStack>
              <Text>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount / 100)}
              </Text>
              <Text>{invoice.sms_count} SMS</Text>
              <Text>{invoice.mau_count} MAUs</Text>
            </Grid>
          ))}
        </Box>
      )}
    </Card>
  );
};

export const BillingHistory = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved />
    </Suspense>
  );
};
