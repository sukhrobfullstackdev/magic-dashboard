import { Button, Card, Text } from '@magiclabs/ui-components';
import { Divider, HStack } from '@styled/jsx';

export const EmbeddedWalletResources = () => {
  return (
    <Card>
      <HStack mdDown={{ flexDir: 'column', alignItems: 'start' }}>
        <Text.H4 fontWeight="semibold">Resources</Text.H4>
        <HStack justifyContent="end" gap={6} flex={1}>
          <a href="https://magic.link/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="text" label="Docs" />
          </a>
          <Divider orientation="vertical" color="neutral.tertiary" h="1.375rem" />
          <a href="https://magic.link/guides" target="_blank" rel="noopener noreferrer">
            <Button variant="text" label="Guides" />
          </a>
          <Divider orientation="vertical" color="neutral.tertiary" h="1.375rem" />
          <a href="https://help.magic.link/knowledge" target="_blank" rel="noopener noreferrer">
            <Button variant="text" label="Help Center" />
          </a>
        </HStack>
      </HStack>
    </Card>
  );
};
