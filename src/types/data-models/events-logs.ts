export enum LoginEventStatus {
  LOGIN_INITIATED = 'LOGIN_INITIATED',
  EMAIL_DELIVERED = 'EMAIL_DELIVERED',
  EMAIL_BOUNCED = 'EMAIL_BOUNCED',
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_OPENED = 'EMAIL_OPENED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  ERROR = 'ERROR',
}

export enum DeviceRegEventStatus {
  NEW_DEVICE_DETECTED = 'NEW_DEVICE_DETECTED',
  DEVICE_REG_EMAIL_DELIVERED = 'DEVICE_REG_EMAIL_DELIVERED',
  DEVICE_REG_EMAIL_BOUNCED = 'DEVICE_REG_EMAIL_BOUNCED',
  DEVICE_REG_EMAIL_SENT = 'DEVICE_REG_EMAIL_SENT',
  DEVICE_REG_EMAIL_OPENED = 'DEVICE_REG_EMAIL_OPENED',
  DEVICE_REG_APPROVED = 'DEVICE_REG_APPROVED',
  DEVICE_REG_REJECTED = 'DEVICE_REG_REJECTED',
}

const eventLogStatuses = {
  ...LoginEventStatus,
  ...DeviceRegEventStatus,
};

export type EventLogStatus = keyof typeof eventLogStatuses;

export enum EventLogAuthMethod {
  EMAIL_LINK = 'EMAIL_LINK',
  EMAIL_OTP = 'EMAIL_OTP',
}

export enum EventLogProvider {
  POSTMARK = 'POSTMARK',
  SENDGRID = 'SENDGRID',
}

export enum EventGroupType {
  LOGIN = 'LOGIN',
  NEW_DEVICE_REGISTRATION = 'NEW_DEVICE_REGISTRATION',
}

export enum TimelineStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export type EventLogLoginItem = {
  eventId: string;
  loginId: string;
  groupId?: string | null;
  groupType?: EventGroupType;
  clientId: number;
  encodedClientId: string;
  userIdentifierType: string;
  userIdentifierValue: string;
  authUserId?: string | null;
  messageId: string;
  eventStatus: EventLogStatus;
  eventStatusCode?: number | null;
  eventDetail: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  provider?: EventLogProvider | null;
  authMethod?: EventLogAuthMethod | null;
  timestamp: number;
  sort?: [number, number, string];
};

export type EventLogLoginMetaData = {
  numItems: number;
};

export type EventLogLoginResponse = {
  metadata: EventLogLoginMetaData;
  events: EventLogLoginItem[];
};

export type EventDetailData = {
  userIdentifierValue: string;
  authUserId?: string | null;
  provider?: EventLogProvider | null;
  userAgent?: string | null;
  timestamp: number;
  ipAddress?: string | null;
  hasCustomSMTP?: boolean;
};

export type PendingEvent = {
  eventId: string;
  eventStatus: EventLogStatus;
};

export type TimelineEvent = {
  event: EventLogLoginItem | PendingEvent;
  timelineStatus: TimelineStatus;
};

export type EventLogTokenResponse = {
  token?: string;
};

export type EventLogStatCount = {
  key: EventLogStatus;
  docCount: number;
};

export type EventLogStatsResponse = {
  numUniqueUsers: number;
  avgLoginTimeSec: number;
  statusCounts: EventLogStatCount[];
};

export type EventLogsTokenRequestParams = {
  magic_client_id: string;
};

export type EventLogsPageParams = {
  afterEventId?: string;
  afterTimestamp?: number;
  afterEventCode?: number;
};

export type EventLogRequestParams = {
  group_id?: string;
  limit?: number;
  sort_time?: 'asc' | 'desc';
  start_timestamp?: number;
  end_timestamp?: number;
  search_after_event_id?: string;
  search_after_timestamp?: number;
  search_after_event_code?: number;
  query?: string;
} & EventLogsTokenRequestParams;

export type EventLogsParams = {
  timeFilter?: number;
  pageParam?: EventLogsPageParams;
} & EventLogRequestParams &
  EventLogsTokenRequestParams;

export type EventLogStatsParams = {
  timeFilter?: number;
} & EventLogsTokenRequestParams;

export type EventStatusConfig = {
  completeLabel: string;
  pendingLabel?: string;
  isFinal?: boolean;
  isError?: boolean;
  isInitiator?: boolean;
};

export type EventGroupConfig = {
  statusOrder: EventLogStatus[];
  statusOrderWithErrors: EventLogStatus[];
  statusOrderWithSmtp: EventLogStatus[];
};
