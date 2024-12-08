import { CustomSmtpInfoParams } from '@hooks/data/custom-smtp/types';
import { QueryKey } from '@tanstack/react-query';

export const customSmtpQueryKeys = {
  base: ['customSmtp'] as QueryKey,

  info: (params: CustomSmtpInfoParams) => [[...customSmtpQueryKeys.base, 'info'], params] as const,
};

export type CustomSmtpInfoQueryKey = ReturnType<typeof customSmtpQueryKeys.info>;
