import { LoadingSpinner } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';

export default function Loading() {
  return (
    <Center w="full" h="calc(50vh - 56px)">
      <LoadingSpinner />
    </Center>
  );
}
