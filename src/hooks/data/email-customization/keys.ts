import { GetTemplateBindings } from '@hooks/data/email-customization/types';
import { type QueryKey } from '@tanstack/react-query';

export const emailCustomizationQueryKeys = {
  base: ['emailCustomization'] as QueryKey,

  templateBindings: (params: GetTemplateBindings) =>
    [[...emailCustomizationQueryKeys.base, 'templateBindings'], params] as const,
};

export type TemplateBindingsQueryKey = ReturnType<typeof emailCustomizationQueryKeys.templateBindings>;
