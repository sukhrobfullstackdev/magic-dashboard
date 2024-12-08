import { FormCard } from '@components/presentation/form-card';
import { TermsAndPoliciesDetails } from '@components/views/customization-view/components/terms-and-policies-details';
import { UploadTermsAndPolicies } from '@components/views/customization-view/components/upload-terms-and-policies';
import { useEditTermsAndPoliciesMutation } from '@hooks/data/app';
import { App } from '@hooks/data/user/types';
import { isValidURL } from '@libs/validator';
import { useToast } from '@magiclabs/ui-components';
import { useState } from 'react';

type TermsAndPoliciesCardProps = {
  app: App;
};

export const TermsAndPoliciesCard = ({ app }: TermsAndPoliciesCardProps) => {
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [termsOfService, setTermsOfService] = useState(app.appTermsOfServiceUri || '');
  const [privacyPolicy, setPrivacyPolicy] = useState(app.appPrivacyPolicyUri || '');
  const [termsOfServiceError, setTermsOfServiceError] = useState('');
  const [privacyPolicyError, setPrivacyPolicyError] = useState('');
  const { createToast } = useToast();
  const invalidUrlMessage = 'Invalid format. Please try again.';

  const { mutateAsync: editTermsAndPolicies } = useEditTermsAndPoliciesMutation({
    onSuccess: () => {
      createToast({
        message: 'Terms and policies saved!',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to save',
        variant: 'error',
      });
    },
  });

  const handleCancel = () => {
    setTermsOfService(app.appTermsOfServiceUri || '');
    setPrivacyPolicy(app.appPrivacyPolicyUri || '');
    setTermsOfServiceError('');
    setPrivacyPolicyError('');
    setIsReadOnlyView(true);
  };

  const handleSave = async () => {
    const termsToSubmit = termsOfService === '' ? null : termsOfService.trim();
    const privacyToSubmit = privacyPolicy === '' ? null : privacyPolicy.trim();

    if (termsToSubmit !== null && !isValidURL(termsToSubmit)) {
      setTermsOfServiceError(invalidUrlMessage);
      return;
    }

    if (privacyToSubmit !== null && !isValidURL(privacyToSubmit)) {
      setPrivacyPolicyError(invalidUrlMessage);
      return;
    }

    await editTermsAndPolicies({
      appId: app.appId,
      termsOfService: termsToSubmit,
      privacyPolicy: privacyToSubmit,
    });

    setIsReadOnlyView(true);
  };

  return (
    <FormCard
      id="card-edit-terms-and-policies"
      title="Terms and Policies"
      onEdit={() => setIsReadOnlyView(false)}
      onCancel={handleCancel}
      isReadOnlyView={isReadOnlyView}
      readonlyView={<TermsAndPoliciesDetails termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
      onSave={handleSave}
      isFormValid
      editView={
        <UploadTermsAndPolicies
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          setTermsOfService={setTermsOfService}
          setPrivacyPolicy={setPrivacyPolicy}
          termsOfServiceError={termsOfServiceError}
          privacyPolicyError={privacyPolicyError}
          setTermsOfServiceError={setTermsOfServiceError}
          setPrivacyPolicyError={setPrivacyPolicyError}
        />
      }
    />
  );
};
