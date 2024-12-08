import { format, fromUnixTime } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const parseToDate = (value?: string | number | null) => {
  if (typeof value === 'string') {
    return new Date(value);
  } else if (typeof value === 'number') {
    return fromUnixTime(value);
  }

  return new Date(0);
};

export const formatToDate = (date: string | number | Date) => {
  return format(date, 'MMM dd, yyyy');
};

export const formatToDateWithTimestamp = (date: string | number | Date) => {
  return format(date, 'MMM dd yyyy hh:mm:ss');
};

export const formatDateInUtc = (date?: string | number | Date) => {
  if (!date) return '';
  const utcDate = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd HH:mm:ss');
  return format(utcDate, "HH:mm:ss 'UTC' MM/dd");
};
