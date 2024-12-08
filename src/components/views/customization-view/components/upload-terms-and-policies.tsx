import { UrlInput } from '@components/views/customization-view/components/url-input';
import { Stack } from '@styled/jsx';

type UploadTermsAndPoliciesProps = {
  termsOfService: string;
  privacyPolicy: string;
  setTermsOfService: (url: string) => void;
  setPrivacyPolicy: (url: string) => void;
  termsOfServiceError: string;
  privacyPolicyError: string;
  setTermsOfServiceError: (errorMessage: string) => void;
  setPrivacyPolicyError: (errorMessage: string) => void;
};

export const UploadTermsAndPolicies = ({
  termsOfService,
  privacyPolicy,
  setTermsOfService,
  setPrivacyPolicy,
  termsOfServiceError,
  privacyPolicyError,
  setTermsOfServiceError,
  setPrivacyPolicyError,
}: UploadTermsAndPoliciesProps) => {
  return (
    <Stack gap={6}>
      <UrlInput
        label="Terms of Service"
        value={termsOfService}
        tooltip="If a URL is added, users can click a link to view the terms and conditions during connection."
        setUrl={setTermsOfService}
        errorMessage={termsOfServiceError}
        setErrorMessage={setTermsOfServiceError}
      />
      <UrlInput
        label="Privacy Policy"
        value={privacyPolicy}
        tooltip="If a URL is added, users can click a link to view the privacy policy during connection."
        setUrl={setPrivacyPolicy}
        errorMessage={privacyPolicyError}
        setErrorMessage={setPrivacyPolicyError}
      />
    </Stack>
  );
};
