import { TimelineEventItem } from '@components/views/event-logs-view/timeline-event-item';
import { type EventLogLoginItem, type TimelineEvent } from '@custom-types/data-models/events-logs';
import { eventsToTimeline } from '@libs/event-logs';
import { Box } from '@styled/jsx';
import { useMemo } from 'react';

type Props = {
  events?: EventLogLoginItem[];
  isFetching?: boolean;
  hasCustomSmtp?: boolean;
};

export const Timeline = ({ events, isFetching = false, hasCustomSmtp = false }: Props) => {
  const timelineEvents: TimelineEvent[] = useMemo(
    () => eventsToTimeline(events, hasCustomSmtp),
    [events, hasCustomSmtp],
  );

  return (
    <Box>
      {Boolean(timelineEvents?.length) &&
        !isFetching &&
        timelineEvents.map((timelineEvent: TimelineEvent, i: number) => (
          <TimelineEventItem
            timelineEvent={timelineEvent}
            isBottom={i === timelineEvents.length - 1}
            key={`${timelineEvent.event.eventId}timeline-event`}
          />
        ))}

      {/* placeholders when fetching */}
      {isFetching &&
        [...Array(4).keys()].map((num: number, i: number) => (
          // skipcq: JS-0437
          <TimelineEventItem isPlaceholder isBottom={i === 3} key={`${num}${i}timeline-event-placeholder`} />
        ))}
    </Box>
  );
};
