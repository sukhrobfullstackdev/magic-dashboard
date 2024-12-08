import { eventGroupConfig, eventStatusConfig } from '@constants/event-logs';
import {
  EventGroupType,
  EventLogProvider,
  LoginEventStatus,
  TimelineStatus,
  type EventDetailData,
  type EventLogLoginItem,
  type EventLogStatCount,
  type EventLogStatus,
  type EventStatusConfig,
  type PendingEvent,
  type TimelineEvent,
} from '@custom-types/data-models/events-logs';
import { detectBrowser, detectPlatform } from '@libs/user-agent';
import { fromUnixTime, getUnixTime } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const getEventLogUserAgent = (userAgent?: string | null): string => {
  if (!userAgent) return 'Unknown';

  const browser = detectBrowser(userAgent);
  const platform = detectPlatform(userAgent);
  const separator = browser && platform ? ', ' : '';
  return browser || platform ? `${browser || ''}${separator}${platform || ''}` : 'Unknown';
};

export const getTimeValue = (timestamp: number): string => {
  if (!timestamp) return 'Unknown';
  const date = fromUnixTime(timestamp);
  const time = formatInTimeZone(date, 'UTC', 'KK:mm:ss');
  const day = formatInTimeZone(date, 'UTC', 'LL/dd');
  return time && day ? `${time} UTC ${day}` : 'Unknown';
};

export const getProviderLabel = (provider?: EventLogProvider | null, hasCustomSMTP = false): string => {
  switch (provider) {
    case EventLogProvider.POSTMARK:
      return 'Postmark';
    case EventLogProvider.SENDGRID:
      return 'SendGrid';
    default:
      return hasCustomSMTP ? 'Custom sender' : 'Unknown';
  }
};

export const getEventTypeString = (eventType?: EventLogStatus, isPending?: boolean, eventDetail?: string): string => {
  const conf: EventStatusConfig | null =
    eventType && eventStatusConfig[eventType] ? eventStatusConfig[eventType] : null;

  if (!conf) return 'Unknown';

  if (eventType === LoginEventStatus.ERROR) {
    return eventDetail || conf.completeLabel;
  }

  return isPending && conf.pendingLabel ? conf.pendingLabel : conf.completeLabel;
};

export const isError = (eventStatus: EventLogStatus) => {
  return Boolean(eventStatusConfig[eventStatus]?.isError);
};

export const getErrorStatusTypes = (): EventLogStatus[] => {
  const output: EventLogStatus[] = [];

  Object.keys(eventStatusConfig).forEach((confKey: string) => {
    if (eventStatusConfig[confKey].isError) {
      output.push(confKey as EventLogStatus);
    }
  });

  return output;
};

export const getErrorCount = (statusCounts: EventLogStatCount[]): number => {
  let errorCount = 0;

  statusCounts.forEach((count: EventLogStatCount): void => {
    if (isError(count.key)) errorCount += count.docCount;
  });

  return errorCount;
};

export const getConversionRate = (statusCounts: EventLogStatCount[]): number => {
  let success = 0;
  let initiated = 0;

  statusCounts.forEach((count: EventLogStatCount): void => {
    if (count.key === LoginEventStatus.LOGIN_INITIATED) {
      initiated = count.docCount;
    }

    if (count.key === LoginEventStatus.LOGIN_SUCCESS) {
      success = count.docCount;
    }
  });

  return parseFloat(((success / initiated) * 100).toFixed(2));
};

export const getStartEndTimestamp = (endDays = 30): { start: number; end: number } => {
  const date = getUnixTime(new Date());
  return {
    end: date,
    start: date - endDays * 24 * 60 * 60,
  };
};

export const isPendingEvent = (eventStatus: EventLogStatus): boolean => {
  return !eventStatusConfig[eventStatus].isFinal && !eventStatusConfig[eventStatus].isError;
};

export const getPendingEvent = (event?: EventLogLoginItem, hasCustomSmtp = false): PendingEvent => {
  if (!event) {
    return {
      eventId: '0',
      eventStatus: LoginEventStatus.LOGIN_INITIATED,
    };
  }

  const { eventStatus, groupType } = event;
  const groupConf = groupType ? eventGroupConfig[groupType] : eventGroupConfig[EventGroupType.LOGIN];
  const statusOrder = hasCustomSmtp ? groupConf.statusOrderWithSmtp : groupConf.statusOrder;

  return {
    eventId: '0',
    eventStatus: statusOrder[statusOrder.indexOf(eventStatus) + 1],
  };
};

export const eventsToTimeline = (events: EventLogLoginItem[] = [], hasCustomSmtp = false): TimelineEvent[] => {
  let hasPendingEvent = true;

  // compose and sort timeline event array
  let timeline: TimelineEvent[] = events
    .slice(0, 5)
    .map((event: EventLogLoginItem) => {
      if (!isPendingEvent(event.eventStatus)) hasPendingEvent = false;

      return {
        event,
        timelineStatus: isError(event.eventStatus) ? TimelineStatus.ERROR : TimelineStatus.COMPLETE,
      };
    })
    .sort((a: TimelineEvent, b: TimelineEvent) => {
      const aEvent = a.event as EventLogLoginItem;
      const bEvent = b.event as EventLogLoginItem;

      const groupConf = aEvent.groupType ? eventGroupConfig[aEvent.groupType] : eventGroupConfig[EventGroupType.LOGIN];

      const statusOrder = groupConf.statusOrderWithErrors;

      if (aEvent.timestamp === bEvent.timestamp) {
        return statusOrder.indexOf(aEvent.eventStatus) < statusOrder.indexOf(bEvent.eventStatus) ? 1 : -1;
      }

      return aEvent.timestamp < bEvent.timestamp ? 1 : -1;
    });

  if (!hasPendingEvent) return timeline;

  timeline = [
    {
      event: getPendingEvent(timeline[0]?.event as EventLogLoginItem, hasCustomSmtp),
      timelineStatus: TimelineStatus.PENDING,
    },
    ...timeline,
  ];

  return timeline;
};

// for group of events that share login ID and retuning details and meta data
export const getEventDetails = (events: EventLogLoginItem[], hasCustomSmtp = false): EventDetailData => {
  let output: EventDetailData = {
    userIdentifierValue: events[events.length - 1].userIdentifierValue,
    timestamp: events[events.length - 1].timestamp,
  };

  // loop backwards to get the latest valid values
  for (let i = events.length - 1; i >= 0; i--) {
    const curr = events[i];

    if (eventStatusConfig[curr.eventStatus].isInitiator) {
      output.userAgent = curr.userAgent;
    }

    output = {
      ...output,
      ...(Boolean(curr.provider) && { provider: curr.provider }),
      ...(Boolean(curr.ipAddress) && { ipAddress: curr.ipAddress }),
      ...(Boolean(curr.authUserId) && { authUserId: curr.authUserId }),
    };
  }

  output.hasCustomSMTP = !output.provider && hasCustomSmtp;

  return output;
};
