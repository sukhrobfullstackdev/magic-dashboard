import { CustomSmtpInfoQueryKey } from '@hooks/data/custom-smtp/keys';
import { CustomSmtpInfo } from '@hooks/data/custom-smtp/types';
import { getCustomSmtpInfo } from '@services/custom-smtp';
import { type QueryFunction } from '@tanstack/react-query';
import { z } from 'zod';

// SCHEMAS
const customSmtpInfoSchema = z.object({
  custom_smtp_settings: z.object({
    sender_email: z.string(),
    sender_name: z.string(),
    host: z.string(),
    port: z.number(),
    user_name: z.string(),
    user_password: z.string(),
  }),
});

export const makeCustomSmtpInfoFetcher =
  (): QueryFunction<CustomSmtpInfo | null, CustomSmtpInfoQueryKey> =>
  async ({ queryKey: [, { appId }] }) => {
    const { data, error } = await getCustomSmtpInfo(appId);
    if (error) {
      throw error;
    }

    const validation = customSmtpInfoSchema.safeParse(data);
    if (!validation.success) {
      return null;
    }

    const customSmtpInfo = validation.data.custom_smtp_settings;

    return {
      senderEmail: customSmtpInfo.sender_email,
      senderName: customSmtpInfo.sender_name,
      host: customSmtpInfo.host,
      port: customSmtpInfo.port.toString(),
      userName: customSmtpInfo.user_name,
      userPassword: customSmtpInfo.user_password,
    };
  };
