import {
  LoginEventStatus,
  TimelineStatus,
  type EventLogLoginItem,
  type TimelineEvent,
} from '@custom-types/data-models/events-logs';
import { getEventTypeString, getTimeValue } from '@libs/event-logs';
import { IcoCheckmarkCircleFill, IcoWarning, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Circle, HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { type FC } from 'react';
import Skeleton from 'react-loading-skeleton';

type Props = {
  timelineEvent?: TimelineEvent;
  isBottom?: boolean;
  isPlaceholder?: boolean;
};

const errorDetails: { [key: string]: string } = {
  'Rate limit exceeded': 'Contact Magic Support to increase your app’s API rate limit',
  default: '',
};

export const LoadingDot = () => (
  <Stack pos="relative" mt="0.5" w={5}>
    <Circle pos="absolute" w={5} h={5} bg="brand.lightest" />
    <Circle pos="absolute" w={2.5} h={2.5} top="5px" left="5px" bg="brand.base" />
  </Stack>
);

export const TimelineEventItem: FC<Props> = ({ timelineEvent, isBottom = false, isPlaceholder = false }) => {
  const { event, timelineStatus } = timelineEvent || {};
  const isPending = timelineStatus === TimelineStatus.PENDING;
  const isError = timelineStatus === TimelineStatus.ERROR;
  const eventDetail: string | undefined = (event as EventLogLoginItem)?.eventDetail;

  const getIcon = () => {
    const props = { width: '20px', height: '20px', className: css({ pos: 'relative', mt: 0.5 }) };

    if (isPlaceholder) {
      return <LoadingDot />;
    }

    switch (timelineStatus) {
      case TimelineStatus.PENDING:
        return <LoadingDot />;
      case TimelineStatus.ERROR:
        return <IcoWarning color={token('colors.negative.base')} {...props} />;
      default:
        return <IcoCheckmarkCircleFill color={token('colors.brand.base')} {...props} />;
    }
  };

  const errorDetail = ((): string | null => {
    if (!isError || !event) return null;

    if (event?.eventStatus === LoginEventStatus.ERROR) {
      return errorDetails[eventDetail] || null;
    }

    return eventDetail;
  })();

  return (
    <HStack gap={4} alignItems="start">
      <VStack pos="relative" flex={0}>
        <Box
          pos="absolute"
          top="14px"
          left="9px"
          w="2px"
          h={errorDetail ? '132px' : '66px'}
          bg={isBottom ? undefined : 'surface.tertiary'}
        />
        {getIcon()}
      </VStack>
      <Box flex={1} mb={5}>
        {isPlaceholder && (
          <Stack w="172px" gap={2}>
            <Skeleton height={14} width={154} />
            <Skeleton height={14} />
          </Stack>
        )}
        {!isPlaceholder && Boolean(timelineEvent) && (
          <>
            <Text
              fontWeight="medium"
              styles={{
                color: isError ? token('colors.negative.base') : isPending ? token('colors.text.tertiary') : undefined,
              }}
            >
              {getEventTypeString(event?.eventStatus, isPending, eventDetail)}
            </Text>
            <Text size="sm" fontColor="text.tertiary">
              {isPending ? 'Waiting...' : getTimeValue((event as EventLogLoginItem).timestamp)}
            </Text>
            {isError && errorDetail && (
              <Text fontWeight="normal" size="sm" variant="error">
                {errorDetail}
              </Text>
            )}
          </>
        )}
      </Box>
    </HStack>
  );
};
