import { TemplateBindingsQueryKey } from '@hooks/data/email-customization/keys';
import { TemplateBinding } from '@hooks/data/email-customization/types';
import { parseToDate } from '@libs/date';
import { getTemplateBindingsV2 } from '@services/custom-message-template-v2';
import { QueryFunction } from '@tanstack/react-query';

export const makeTeamBindingsFetcher =
  (): QueryFunction<TemplateBinding[], TemplateBindingsQueryKey> =>
  async ({ queryKey: [, { appId }] }) => {
    const { data, error } = await getTemplateBindingsV2(appId);
    if (error) {
      throw error;
    }

    return (
      data?.map((v) => ({
        id: v.id,
        appId: v.magic_client_id,
        messageTemplateId: v.message_template_id,
        useCase: v.use_case,
        variation: v.variation,
        contentType: v.content_type,
        locale: v.locale,
        isActive: v.is_active,
        messageTemplate: v.message_template,
        createdAt: parseToDate(v.time_created),
        updatedAt: parseToDate(v.time_updated),
      })) ?? []
    );
  };
