import DOMPurify from 'dompurify';
import { flatAutocompleteData } from './template-view/autocomplete';

export const convertStringWithTemplateVariables = (inputHtml: string, appName?: string) => {
  let outputHtml = inputHtml;

  const autocompleteData = { ...flatAutocompleteData };
  if (appName) {
    autocompleteData['app.name'] = appName;
  }

  for (const key in autocompleteData) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    outputHtml = outputHtml.replace(regex, autocompleteData[key]);
  }

  return outputHtml;
};

export const sanitizeHtml = (inputHtml: string) => {
  const sanitizedHtml = DOMPurify.sanitize(inputHtml, { USE_PROFILES: { html: true } });

  return sanitizedHtml;
};

export const sanitizeAndConvertHtml = (inputHtml: string, appName?: string) => {
  const convertedHtml = convertStringWithTemplateVariables(inputHtml, appName);
  const sanitizedHtml = DOMPurify.sanitize(convertedHtml, { USE_PROFILES: { html: true } });

  return sanitizedHtml;
};
