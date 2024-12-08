import { Text } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';

type TermsAndPoliciesDetailsProps = {
  termsOfService?: string;
  privacyPolicy?: string;
};

const Row = ({ uri, type }: { uri: string; type: string }) => {
  return (
    <HStack justify="space-between">
      <Text>{uri}</Text>
      <Text fontColor="text.tertiary">{type}</Text>
    </HStack>
  );
};

export const TermsAndPoliciesDetails = ({ termsOfService, privacyPolicy }: TermsAndPoliciesDetailsProps) => {
  if (!termsOfService && !privacyPolicy) {
    return <Text fontColor="text.tertiary">Add your own Terms and Policies you want your users agree to.</Text>;
  }

  return (
    <Stack gap={3}>
      {termsOfService && <Row uri={termsOfService} type="Terms of Service" />}
      {privacyPolicy && <Row uri={privacyPolicy} type="Privacy Policy" />}
    </Stack>
  );
};
