import { type CustomMessageTemplate, type TemplateUseCase } from '@services/custom-message-template-v2';

// RETURN TYPES
export type TemplateBinding = {
  id: string;
  appId: string;
  messageTemplateId: string;
  useCase: TemplateUseCase;
  variation: string;
  contentType: string;
  locale: string;
  isActive: boolean;
  messageTemplate: CustomMessageTemplate;
  createdAt: Date;
  updatedAt: Date;
};

// PARAMS
export type GetTemplateBindings = {
  appId: string;
};
