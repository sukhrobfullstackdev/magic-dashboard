import { type EventLogsLoginsQueryKey, type EventLogsStatsQueryKey } from '@components/hooks/use-event-logs';
import { ENV } from '@config';
import { EVENT_LOG_API_ENDPOINTS } from '@constants/endpoints';
import { EVENT_LOGS_TOKEN_KEY } from '@constants/persistence';
import { type EventLogTokenResponse, type EventLogsPageParams } from '@custom-types/data-models/events-logs';
import { camelizeSnakeKeys } from '@libs/common';
import { logger } from '@libs/datadog';
import { getStartEndTimestamp } from '@libs/event-logs';
import { Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

// FETCHERS
export const eventLogTokenFetcher = async (magic_client_id: string): Promise<EventLogTokenResponse> => {
  let res: FortmaticAPIResponse<EventLogTokenResponse>;
  const existingToken: string | null = localStorage.getItem(EVENT_LOGS_TOKEN_KEY);

  if (existingToken) return { token: existingToken };

  try {
    res = await Post('/v1/dashboard/magic_dashboard/events/token', {
      magic_client_id,
    });
  } catch {
    throw new Error('There was a problem fetching token for login events');
  }

  const { data } = res;

  // set token in local storage if returned
  if (data?.token) {
    localStorage.setItem(EVENT_LOGS_TOKEN_KEY, data.token);
  }

  return { token: data?.token };
};

export const eventLogsFetcher = async ({
  pageParam,
  queryKey: [, { magic_client_id, timeFilter = 30, ...requestParams }],
}: {
  queryKey: EventLogsLoginsQueryKey;
  pageParam: EventLogsPageParams;
}) => {
  let res;

  if (pageParam?.afterEventId) {
    requestParams = {
      ...requestParams,
      search_after_event_id: pageParam.afterEventId,
      search_after_timestamp: pageParam.afterTimestamp,
      search_after_event_code: pageParam.afterEventCode,
    };
  }

  const { start, end } = getStartEndTimestamp(timeFilter);

  requestParams = {
    ...requestParams,
    start_timestamp: start,
    end_timestamp: end,
  };

  try {
    const { token } = await eventLogTokenFetcher(magic_client_id);
    const url = `${EVENT_LOG_API_ENDPOINTS[ENV]}/events/login?`;
    const urlParams = new URLSearchParams(requestParams ? (requestParams as Record<string, string>) : {});

    res = await fetch(url + urlParams, {
      method: 'GET',
      headers: {
        'x-magic-authorization': token || '',
      },
    });
  } catch (err) {
    const message = 'There was a problem fetching event logs for login';

    logger.error(
      message,
      {
        clientId: magic_client_id,
        requestParams,
        timeFilter: `${timeFilter} days`,
      },
      err as Error,
    );

    throw new Error(message);
  }

  const data = await res.json();

  // if token is bad/expired remove it from local storage and RQ will try to fetch it again on the next try
  if (!res?.ok) {
    if (res.status === 401 || data?.detail === 'token has invalid claims: token is expired') {
      localStorage.removeItem(EVENT_LOGS_TOKEN_KEY);
    }

    throw new Error(data.detail);
  }

  return camelizeSnakeKeys(data);
};

export const eventLogsStatsFetcher = async ({
  queryKey: [, { magic_client_id, timeFilter = 30 }],
}: {
  queryKey: EventLogsStatsQueryKey;
}) => {
  let res;

  const timeStamps = getStartEndTimestamp(timeFilter);

  try {
    const { token } = await eventLogTokenFetcher(magic_client_id);
    const url = `${EVENT_LOG_API_ENDPOINTS[ENV]}/events/login/stats?`;

    const urlParams = new URLSearchParams({
      start_timestamp: timeStamps.start + '',
      end_timestamp: timeStamps.end + '',
    });

    res = await fetch(url + urlParams, {
      headers: {
        'x-magic-authorization': token || '',
      },
    });
  } catch (err) {
    const message = 'There was a problem fetching event stats for login';

    logger.error(
      message,
      {
        clientId: magic_client_id,
        timeStamps,
        timeFilter: `${timeFilter} days`,
      },
      err as Error,
    );

    throw new Error(message);
  }

  const data = await res.json();

  // if token is bad/expired remove it from local storage and RQ will try to fetch it again on the next try
  if (!res?.ok) {
    if (res.status === 401 || data?.detail === 'token has invalid claims: token is expired') {
      localStorage.removeItem(EVENT_LOGS_TOKEN_KEY);
    }

    throw new Error(data.detail);
  }

  return camelizeSnakeKeys(data);
};
