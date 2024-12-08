import { Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { type FC } from 'react';

type Props = {
  title: string;
  description?: string;
  icon?: JSX.Element;
};

export const EmptyDataAlert: FC<Props> = ({ title, description, icon }) => {
  return (
    <VStack px={8} py={16} my={8}>
      <Box mb={4}>{icon}</Box>
      <Text fontColor="text.tertiary" fontWeight="semibold">
        {title}
      </Text>
      {description && (
        <Text size="sm" fontColor="text.tertiary">
          {description}
        </Text>
      )}
    </VStack>
  );
};
