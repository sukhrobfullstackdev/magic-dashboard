'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { eventLogsQueryKeys, useEventLogStats, useEventLogsInfinite } from '@components/hooks/use-event-logs';
import { BetaTag } from '@components/presentation/beta-tag';

import { EmptyDataAlert } from '@components/views/event-logs-view/empty-data-alert';
import { EventDetails } from '@components/views/event-logs-view/event-details';
import { LoginEventsTable } from '@components/views/event-logs-view/login-events-table';
import { StatBox, StatUnit, type Props as StatProps } from '@components/views/event-logs-view/stat-box';
import { MAGIC_TYPEFORM_URL } from '@constants/urls';
import { type EventLogLoginItem } from '@custom-types/data-models/events-logs';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { type App } from '@hooks/data/user/types';
import { getConversionRate, getErrorCount, getErrorStatusTypes } from '@libs/event-logs';
import {
  Card,
  DropdownOption,
  DropdownSelector,
  IcoDismiss,
  IcoExpiration,
  IcoSearch,
  IcoWarningFill,
  SegmentedControl,
  Tab,
  Text,
  TextInput,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Grid, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useDebounce, useThrottle } from '@uidotdev/usehooks';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export type EventTypeFilter = 'all' | 'errors';

type TimeFilterOption = {
  label: string;
  value: string;
};

export type HandleActiveEventParams = {
  groupId?: string | null;
  meta?: { [key: string]: unknown };
  refresh?: boolean;
};

const timeFilterOptions: TimeFilterOption[] = [
  {
    label: 'Last 24 hours',
    value: '1',
  },
  {
    label: 'Last 7 days',
    value: '7',
  },
  {
    label: 'Last 14 days',
    value: '14',
  },
  {
    label: 'Last 30 days',
    value: '30',
  },
];

const EVENTS_PAGE_LIMIT = 25;
const SCROLL_THROTTLE = 500;
const SEARCH_DEBOUNCE = 1000;

const emptyEvents: EventLogLoginItem[] = [];

const Resolved = ({ app }: { app: App }) => {
  const { trackAction } = useAnalytics();
  const { isLoginDebuggingEnabled } = useFlags();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearchParams = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
  const groupIdParam = urlSearchParams.get('groupId') ?? '';
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groupIdParam as string);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [timeFilter, setTimeFilter] = useState<number>(30);
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE);
  const pageRef = useRef<HTMLDivElement>(null);
  const daysLabel = timeFilter === 1 ? `${timeFilter} day` : `${timeFilter} days`;

  const [scrollValues, setScrollValues] = useState<{
    scrollHeight: number | undefined;
    scrollTop: number | undefined;
    clientHeight: number | undefined;
  }>({
    scrollHeight: undefined,
    scrollTop: undefined,
    clientHeight: undefined,
  });
  const throttledValue = useThrottle(scrollValues, SCROLL_THROTTLE);

  // stats query
  const {
    data: statsData,
    isFetching: isFetchingStats,
    refetch: refetchStats,
  } = useEventLogStats(eventLogsQueryKeys.stats({ timeFilter, magic_client_id: app.appId }));

  // event logs infinite query
  const { data, fetchNextPage, isFetching, isFetchingNextPage, isError, hasNextPage, refetch } = useEventLogsInfinite(
    eventLogsQueryKeys.logins({
      magic_client_id: app.appId,
      timeFilter,
      limit: EVENTS_PAGE_LIMIT,
      ...(typeFilter === 'errors' && { event_status: getErrorStatusTypes() }),
      ...(debouncedSearchQuery && { query: debouncedSearchQuery }),
    }),
    {
      initialPageParam: {},
      maxPages: 20,
      getNextPageParam: (lastPage) => {
        if (!lastPage.events.length) return null;
        if ((lastPage?.metadata?.numItems || 0) < EVENTS_PAGE_LIMIT) return null;

        const lastEvent = lastPage.events[lastPage.events.length - 1];
        return {
          afterEventId: lastEvent?.eventId,
          afterTimestamp: lastEvent?.timestamp,
          afterEventCode: lastEvent.sort?.[1] || lastEvent.eventStatusCode || 1,
        };
      },
    },
  );

  const hasEventsData = useMemo(() => data?.pages.some((page) => Boolean(page.events.length)), [data]);
  const flatData = useMemo(() => data?.pages?.flatMap((page) => page.events) ?? emptyEvents, [data]);

  // compute stats from stats data
  const stats = useMemo((): StatProps[] => {
    return [
      {
        label: 'Unique Users',
        value: statsData?.numUniqueUsers || 0,
        defaultValue: 0,
      },
      {
        label: 'Conversion Rate',
        value: statsData?.statusCounts.length ? getConversionRate(statsData.statusCounts) : null,
        unit: StatUnit.PERCENT,
      },
      {
        label: 'Errors',
        value: statsData?.statusCounts.length ? getErrorCount(statsData.statusCounts) : 0,
        defaultValue: 0,
      },
    ];
  }, [statsData]);

  useEffect(() => {
    if (!isLoginDebuggingEnabled) {
      router.push('/');
    }
  }, []);

  const handleActiveEvent = ({ groupId, meta = {}, refresh = false }: HandleActiveEventParams): void => {
    if (!groupId) {
      trackAction('Event logs details closed');
    }

    if (!groupId && (groupIdParam as string)) {
      // refetch data on close
      if (refresh) {
        refetch();
        refetchStats();
      }

      router.push(`${pathname}?${urlSearchParams.toString()}`);
    }

    if (groupId) {
      trackAction('Event logs details opened', meta);
    }

    if (groupId) {
      urlSearchParams.set('groupId', groupId);
      router.replace(`${pathname}?${urlSearchParams.toString()}`);
      setActiveGroupId(groupId);
    } else {
      setActiveGroupId(null);
    }
  };

  const handleTimeFilter = (value: string): void => {
    trackAction('Event logs time filter clicked', {
      value,
    });

    const intVal = parseInt(value);
    setTimeFilter(isNaN(intVal) ? 30 : intVal);
  };

  const handleTypeFilter = (value: EventTypeFilter, context: 'toggle' | 'review' = 'toggle') => {
    trackAction('Event logs type filter clicked', {
      value,
      ui_context: context,
    });

    setTypeFilter(value);
  };

  const handleClickErrorReview = () => {
    handleTypeFilter('errors', 'review');
    setSearchQuery('');
  };

  const emptyStateMessage: string = (() => {
    if (typeFilter === 'all' && !searchQuery) {
      return `No email login events for last ${daysLabel}`;
    }

    if (typeFilter === 'errors' && !searchQuery) {
      return `No errors found for last ${daysLabel}`;
    }

    return `No results found for last ${daysLabel}`;
  })();

  const handleOnScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollValues({
      scrollHeight: e.currentTarget.scrollHeight,
      scrollTop: e.currentTarget.scrollTop,
      clientHeight: e.currentTarget.clientHeight,
    });
  };

  useEffect(() => {
    const { scrollHeight, scrollTop, clientHeight } = throttledValue;
    if (!scrollHeight || !scrollTop || !clientHeight) {
      return;
    }

    const lastPageNumItems = data?.pages[data?.pages.length - 1]?.metadata?.numItems || 0;
    const atBottom = scrollHeight - scrollTop - clientHeight < 300;

    // once the user has scrolled within 300px of the bottom of the table, fetch more data
    if (atBottom && !isFetchingNextPage && hasNextPage && lastPageNumItems === EVENTS_PAGE_LIMIT) {
      fetchNextPage();
    }
  }, [throttledValue]);

  return (
    <Stack p={8} onScroll={handleOnScroll} ref={pageRef}>
      <Stack>
        <HStack justifyContent="space-between" alignItems="start" smDown={{ flexDir: 'column' }}>
          <Stack>
            <HStack gap={3}>
              <Text.H3>Email Logs</Text.H3>
              <BetaTag
                tooltip={
                  <>
                    Email Logs is in beta and currently only displays email login events. If you have feedback,{' '}
                    <a
                      className={css({ color: 'brand.base', fontWeight: 'semibold' })}
                      href={`${MAGIC_TYPEFORM_URL}/event-logs`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      let us know!
                    </a>
                  </>
                }
              />
            </HStack>
            <Text>{`Email logins for the last ${daysLabel}`}</Text>
          </Stack>
          <Box w="240px">
            <DropdownSelector size="sm" onSelect={handleTimeFilter} selectedValue={`${timeFilter}`}>
              {timeFilterOptions.map((option) => (
                <DropdownOption key={option.value} label={option.label} value={option.value} />
              ))}
            </DropdownSelector>
          </Box>
        </HStack>

        {/* stats */}
        <Grid my={4} gap={6} columns={3} lgDown={{ gridTemplateColumns: 1 }}>
          {stats.map((statProps: StatProps) => (
            <StatBox
              {...statProps}
              key={statProps.label}
              isLoading={isFetchingStats}
              handleClickErrorReview={handleClickErrorReview}
              typeFilter={typeFilter}
            />
          ))}
        </Grid>
        <Card>
          <HStack mb={8} smDown={{ flexDir: 'column', alignItems: 'start' }}>
            <Box flex={1}>
              <TextInput
                placeholder="Email, IP address..."
                value={searchQuery}
                onChange={(text) => setSearchQuery(text)}
                aria-label="Search email logs"
              >
                <TextInput.TypeIcon>
                  <IcoSearch />
                </TextInput.TypeIcon>
                {!!searchQuery && (
                  <TextInput.ActionIcon onClick={() => setSearchQuery('')}>
                    <IcoDismiss />
                  </TextInput.ActionIcon>
                )}
              </TextInput>
            </Box>

            <Box w="210px">
              <SegmentedControl
                disabled={!hasEventsData && !isFetching && typeFilter === 'all' && !searchQuery}
                size="sm"
                selectedTab={typeFilter}
                onChange={(value) => {
                  handleTypeFilter(value as EventTypeFilter);
                }}
              >
                <Tab id="all" label="All events" />
                <Tab id="errors" label="Errors only" />
              </SegmentedControl>
            </Box>
          </HStack>
          {(hasEventsData || isFetching) && (
            <LoginEventsTable
              data={flatData}
              isFetching={isFetching}
              isFetchingNextPage={isFetchingNextPage}
              handleActiveEvent={handleActiveEvent}
            />
          )}
          {!hasEventsData && !isFetching && !isError && (
            <EmptyDataAlert
              title={emptyStateMessage}
              description="Logs are currently captured for emails only"
              icon={<IcoExpiration color={token('colors.neutral.primary')} width={50} height={50} />}
            />
          )}
          {isError && !hasEventsData && (
            <EmptyDataAlert
              title="There was a problem fetching login events"
              description="Logs are currently captured for emails only"
              icon={<IcoWarningFill color={token('colors.neutral.primary')} />}
            />
          )}
        </Card>
      </Stack>

      {/* event details modal */}
      <EventDetails
        appId={app.appId}
        isOpen={Boolean(activeGroupId)}
        groupId={activeGroupId}
        close={(refresh: boolean) =>
          handleActiveEvent({
            groupId: null,
            meta: {},
            refresh,
          })
        }
      />
    </Stack>
  );
};

export const EventLogsView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp ? <Resolved app={currentApp} /> : <></>;
};
