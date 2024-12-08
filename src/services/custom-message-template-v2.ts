import { call, Delete, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface CustomMessageTemplate {
  id: string;
  meta: { subject: string; channel: string; encoding: string; content_type: string; locale: string };
  raw: string;
  is_active: boolean;
  time_created: number;
  time_updated: number;
}

export type TemplateUseCase = 'login_email_otp' | 'login_email_link';

export interface MessageTemplateBinding {
  message_template: CustomMessageTemplate;
  id: string;
  magic_client_id: string;
  message_template_id: string;
  use_case: TemplateUseCase;
  variation: string;
  content_type: string;
  locale: string;
  is_active: boolean;
  time_created: number;
  time_updated: number;
}

export interface TemplateData {
  templateId: string;
  html: string;
  useCase: TemplateUseCase;
  variation: string;
  bindingId: string;
  subject: string;
}

export interface CustomMessageTemplateV2Body {
  meta: {
    subject: string;
    encoding?: string;
    content_type?: string;
    locale?: string;
  };
  raw: string;
}

export interface MessageTemplateBindingV2Body {
  message_template_id?: string;
  use_case: string;
  subject?: string;
  variation?: string;
  is_published?: boolean;
  content_type?: string;
  locale?: string;
  content?: {
    type: string;
    value: string;
  }[];
}

export const extractTemplateData = (messageBindings: MessageTemplateBinding[]): TemplateData[] => {
  return messageBindings.map(({ use_case, variation, id: bindingId, message_template }) => {
    const {
      id: templateId,
      raw,
      meta: { subject },
    } = message_template;

    return { templateId, html: raw, useCase: use_case, variation, bindingId, subject };
  });
};

export async function getCustomMessageTemplatesV2(
  magicClientId: string,
): Promise<{ data: CustomMessageTemplate[] | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template`;

  try {
    const headers = new Headers();

    const { data } = await call<Headers, FortmaticAPIResponse<CustomMessageTemplate[]>>('GET', endpoint, headers);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getCustomMessageTemplateByIdV2(
  magicClientId: string,
  customTemplateId: string,
): Promise<{ data: CustomMessageTemplate | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template/${customTemplateId}`;

  try {
    const headers = new Headers({});

    const { data } = await call<Headers, FortmaticAPIResponse<CustomMessageTemplate>>('GET', endpoint, headers);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createCustomMessageTemplateV2(
  magicClientId: string,
  raw: string,
  subject: string,
): Promise<{ data: CustomMessageTemplate | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template`;

  const body = {
    meta: {
      subject,
      encoding: 'utf-8',
      content_type: 'text/html',
      locale: 'en_US',
    },
    raw,
  };

  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const { data } = await call<CustomMessageTemplateV2Body, FortmaticAPIResponse<CustomMessageTemplate>>(
      'POST',
      endpoint,
      headers,
      body,
    );

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateCustomMessageTemplateV2(
  magicClientId: string,
  updatedTemplate: Pick<TemplateData, 'templateId' | 'html' | 'subject'>,
): Promise<{
  data: CustomMessageTemplate | null;
  error: Error | null;
}> {
  const cmtEndpoint = `v1/dashboard/magic_client/${magicClientId}/message_template/${updatedTemplate.templateId}`;

  const cmtBody = {
    raw: updatedTemplate.html,
    meta: {
      subject: updatedTemplate.subject,
    },
  };

  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const { data } = await call<CustomMessageTemplateV2Body, FortmaticAPIResponse<CustomMessageTemplate>>(
      'PATCH',
      cmtEndpoint,
      headers,
      cmtBody,
    );

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getTemplateBindingsV2(
  magicClientId: string,
): Promise<{ data: MessageTemplateBinding[] | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template_binding`;

  try {
    const headers = new Headers({});

    const { data } = await call<Headers, FortmaticAPIResponse<MessageTemplateBinding[]>>('GET', endpoint, headers);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getTemplateBindingByIdV2(
  magicClientId: string,
  templateBindingId: string,
): Promise<{ data: MessageTemplateBinding | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template_binding/${templateBindingId}`;

  try {
    const headers = new Headers({});

    const { data } = await call<Headers, FortmaticAPIResponse<MessageTemplateBinding>>('GET', endpoint, headers);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createTemplateBindingV2(
  magicClientId: string,
  messageTemplateId: string,
  useCase: string,
  name: string,
): Promise<{ data: MessageTemplateBinding | null; error: Error | null }> {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/message_template_binding`;

  const body = {
    message_template_id: messageTemplateId,
    use_case: useCase,
    variation: name,
    is_published: true,
    content_type: 'text/html',
    locale: 'en_US',
  };

  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const { data } = await call<MessageTemplateBindingV2Body, FortmaticAPIResponse<MessageTemplateBinding>>(
      'POST',
      endpoint,
      headers,
      body,
    );

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export const deleteTemplate = async (magic_client_id: string, bindingId: string, templateId: string) => {
  const templateEndpoint = `v1/dashboard/magic_client/${magic_client_id}/message_template/${templateId}`;
  const bindingEndpoint = `v1/dashboard/magic_client/${magic_client_id}/message_template_binding/${bindingId}`;

  try {
    await Delete(bindingEndpoint);
    await Delete(templateEndpoint);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const templateTestV2 = async (
  magicClientId: string,
  template: Pick<TemplateData, 'html' | 'useCase' | 'subject'>,
) => {
  const endpoint = `v1/dashboard/magic_client/${magicClientId}/template_test`;

  const body = {
    use_case: template.useCase,
    subject: template.subject,
    content: [
      {
        type: 'text/plain',
        value: template.html,
      },
      {
        type: 'text/html',
        value: template.html,
      },
    ],
  };

  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const { data } = await call<MessageTemplateBindingV2Body, FortmaticAPIResponse<MessageTemplateBinding>>(
      'POST',
      endpoint,
      headers,
      body,
    );

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};
