import { LoadingSpinner } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';

export const FallbackLoading = () => {
  return (
    <Center height="100dvh" width="100vw" position="fixed" zIndex={9999}>
      <LoadingSpinner size={90} strokeWidth={8} neutral />
    </Center>
  );
};
