import { Text } from '@magiclabs/ui-components';
import { Flex, Stack } from '@styled/jsx';

export const SessionDurationReadyOnlyView = ({ sessionLength }: { sessionLength: number }) => {
  return (
    <Stack gap={6}>
      <Flex>
        <Stack gap={3} flex={1}>
          <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
            Session length
          </Text>
          <Text>{sessionLength} days</Text>
        </Stack>
      </Flex>
    </Stack>
  );
};
