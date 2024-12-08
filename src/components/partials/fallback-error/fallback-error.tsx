import { useSignOutMutation } from '@hooks/data/user';
import { Button, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export const FallbackError = () => {
  const { mutateAsync: signOut, isPending } = useSignOutMutation();

  return (
    <VStack pt={60} gap={4}>
      <Text.H4 fontWeight="semibold">Something went wrong!</Text.H4>
      <Text fontWeight="semibold">Please refresh page or login</Text>
      <Button variant="secondary" label="Go Home" validating={isPending} onPress={() => signOut()} />
    </VStack>
  );
};
