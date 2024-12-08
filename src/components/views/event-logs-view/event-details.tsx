import { useAnalytics } from '@components/hooks/use-analytics';
import { eventLogsQueryKeys, useEventLogs } from '@components/hooks/use-event-logs';
import { Modal } from '@components/presentation/modal/modal';
import { Timeline } from '@components/views/event-logs-view/timeline';
import { MAGIC_DOCS_URL } from '@constants/urls';
import { type EventDetailData } from '@custom-types/data-models/events-logs';
import { useCustomSmtpInfoSuspenseQuery } from '@hooks/data/custom-smtp';
import { customSmtpQueryKeys } from '@hooks/data/custom-smtp/keys';
import { getEventDetails, getEventLogUserAgent, getProviderLabel } from '@libs/event-logs';
import {
  Button,
  CopyButton,
  IcoDismiss,
  IcoInfoCircleFill,
  IconPerson,
  IcoQuestionCircleFill,
  IcoRefresh,
  Text,
  Tooltip,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Grid, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { fromUnixTime } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FC } from 'react';
import Skeleton from 'react-loading-skeleton';

type Props = {
  appId: string;
  groupId: string | null;
  isOpen?: boolean;
  close: (refresh: boolean) => void;
};

type EventLogMetaData = {
  label: string;
  value?: string | null;
  tooltip?: string | null;
};

const Placeholder: { [key: string]: FC } = {
  Header: () => (
    <Stack gap={4} w="400px">
      <Skeleton width={300} />
      <Skeleton height={14} />
    </Stack>
  ),
  Metadata: () => (
    <Stack w="124px" mb={3}>
      <Skeleton height={14} width={100} />
      <Skeleton height={14} />
    </Stack>
  ),
};

export const EventDetails: FC<Props> = ({ appId, groupId, isOpen = false, close }) => {
  const searchParams = useSearchParams();
  const { trackAction } = useAnalytics();
  const [refreshClicked, setRefreshClicked] = useState(false);

  // event logs query
  const { data, refetch, isFetching } = useEventLogs(
    eventLogsQueryKeys.logins({
      ...(groupId && { group_id: groupId }),
      magic_client_id: searchParams?.get('cid') ?? '',
    }),
    {
      enabled: Boolean(groupId),
    },
  );

  // smtp query
  const { data: customSmtpInfo } = useCustomSmtpInfoSuspenseQuery(customSmtpQueryKeys.info({ appId }));

  const hasCustomSmtp = Boolean(customSmtpInfo);
  const eventsData = data?.events;
  const eventDetails: EventDetailData | null = eventsData?.length ? getEventDetails(eventsData, hasCustomSmtp) : null;

  useEffect(() => {
    if (!isOpen) {
      setRefreshClicked(false);
    }
  }, [isOpen]);

  const timeHeading = useMemo(() => {
    if (!isOpen || !eventDetails) return null;
    const date = formatInTimeZone(fromUnixTime(eventDetails.timestamp), 'UTC', 'MMMM d');
    return `${date} Login`;
  }, [eventDetails, isOpen]);

  const metadata = useMemo((): EventLogMetaData[] | null => {
    if (!isOpen || !eventDetails) return null;

    return [
      {
        label: 'Email Provider',
        value: getProviderLabel(eventDetails.provider, eventDetails.hasCustomSMTP),
        tooltip:
          Boolean(eventDetails.provider) && !eventDetails.hasCustomSMTP
            ? 'Magic relies on SendGrid and Postmark for best-in-class email deliverability'
            : null,
      },
      {
        label: 'Initiating User Agent',
        value: getEventLogUserAgent(eventDetails.userAgent),
      },
      {
        label: 'IP Address',
        value: eventDetails.ipAddress || 'Unknown',
      },
    ];
  }, [eventDetails, isOpen]);

  const handleRefresh = () => {
    trackAction('Event details refresh clicked', eventDetails || {});
    setRefreshClicked(true);
    refetch();
  };

  const handleCopy = () => {
    trackAction('Event details copy button clicked', eventDetails || {});
  };

  return (
    <Modal
      className={css({ w: '800px', maxH: '800px', minH: '624px', lgDown: { w: '90vw' }, mdDown: { maxH: 'full' } })}
      in={isOpen}
      handleClose={() => close(refreshClicked)}
      noPadding
    >
      <Stack pos="relative" overflow="hidden" rounded="3xl">
        <Box
          w="100%"
          minH="152px"
          py={10}
          px={8}
          bg="linear-gradient(180deg, rgba(237, 235, 255, 0) 0%, #edebff 114.8%), #fff"
        >
          <HStack pos="absolute" top="16px" right="16px">
            <Button variant="text" size="sm" onPress={handleRefresh} label="Refresh">
              <Button.LeadingIcon>
                <IcoRefresh />
              </Button.LeadingIcon>
            </Button>

            <Button variant="neutral" size="sm" onPress={() => close(refreshClicked)}>
              <Button.LeadingIcon>
                <IcoDismiss />
              </Button.LeadingIcon>
            </Button>
          </HStack>
          <Grid gap={6} h="72px" gridTemplateColumns="69px minmax(100px, 1fr)">
            <IconPerson width={64} height={64} color={token('colors.brand.base')} />
            <Stack gap={0}>
              {isFetching ? (
                <Placeholder.Header />
              ) : (
                <>
                  <HStack maxW="425px" mb={1}>
                    <Text.H3>{eventDetails?.userIdentifierValue}</Text.H3>
                    <CopyButton value={eventDetails?.userIdentifierValue ?? ''} onCopy={handleCopy} showText={false} />
                  </HStack>
                  <Text size="sm" fontWeight="medium">
                    Sub ID:{' '}
                    <Text
                      inline
                      size="sm"
                      fontColor={!eventDetails?.authUserId ? 'text.tertiary' : 'text.primary'}
                      fontWeight="bold"
                    >
                      {eventDetails?.authUserId || 'Unknown'}
                    </Text>
                  </Text>
                </>
              )}
            </Stack>
          </Grid>
        </Box>

        <Box p={10}>
          {isFetching ? <Skeleton width={180} /> : <Text.H5>{timeHeading}</Text.H5>}

          {/* smtp info message */}
          {!isFetching && (
            <HStack mt={4} gap={1.5}>
              <IcoInfoCircleFill width={14} height={14} color={token('colors.neutral.primary')} />
              <Text size="sm" fontColor="text.tertiary">
                {eventDetails?.hasCustomSMTP ? (
                  'Only login-related events available. For deliverability data, visit your email service provider.'
                ) : (
                  <>
                    Only login-related events available. To see a full list of logged events,{' '}
                    <a href={`${MAGIC_DOCS_URL}/authentication/features/event-logs`} target="_blank" rel="noreferrer">
                      <Button variant="text" size="sm" label="read on Docs" />
                    </a>
                    .
                  </>
                )}
              </Text>
            </HStack>
          )}

          <Grid gap={0} mt={7} columns={2}>
            <Timeline events={eventsData} isFetching={isFetching} hasCustomSmtp={hasCustomSmtp} />

            <Stack gap={6} minH="296px" pl={10} borderLeft="1px solid" borderLeftColor="surface.tertiary">
              {Boolean(metadata) &&
                !isFetching &&
                metadata?.map((item: EventLogMetaData) => (
                  <Stack gap={0} key={`metadata-item-${item.label}`}>
                    <HStack>
                      <Text size="sm" fontWeight="medium">
                        {item.label}
                      </Text>
                      {item.tooltip && (
                        <Tooltip
                          content={
                            <Text inline fontColor="text.tertiary" size="xs">
                              {item.tooltip}
                            </Text>
                          }
                        >
                          <IcoQuestionCircleFill
                            color={token('colors.neutral.primary')}
                            height="0.75rem"
                            width="0.75rem"
                          />
                        </Tooltip>
                      )}
                    </HStack>
                    <Text fontColor={item.value === 'Unknown' ? 'text.tertiary' : 'text.primary'}>{item.value}</Text>
                  </Stack>
                ))}

              {isFetching && (
                <Stack gap={6}>
                  {[...Array(3).keys()].map((num: number) => (
                    <Placeholder.Metadata key={`metadata-item-placeholder-${num}`} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid>
        </Box>
      </Stack>
    </Modal>
  );
};
