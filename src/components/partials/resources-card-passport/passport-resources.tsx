import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import ShortcutTile from '@components/partials/resources-card-passport/__components__/shortcut-tile';
import { Card, IcoCommandLine, IcoGuide, IcoOpenBook, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';

const resources = [
  // TODO: Update href's once we have the actual links
  {
    label: 'What is Magic Passport?',
    href: 'https://magic.link/docs/passport',
    icon: <IcoOpenBook width={20} height={20} />,
  },
  {
    label: 'Passport Demo',
    href: 'https://magic.link/passport/quickstart',
    icon: <IcoCommandLine width={20} height={20} />,
  },
  {
    label: 'Guides',
    href: 'https://magic.link/guides',
    icon: <IcoGuide width={20} height={20} />,
  },
];

const PassportResources = () => {
  const { isAvailableForPassportPublicTestnet } = useMagicLDFlags();

  return isAvailableForPassportPublicTestnet ? (
    <Card stack gapType="lg">
      <Text.H4 fontWeight="semibold">Resources</Text.H4>
      <HStack w="full" gap={3} smDown={{ flexDir: 'column' }}>
        {resources.map((resource) => (
          <ShortcutTile key={resource.label} {...resource} />
        ))}
      </HStack>
    </Card>
  ) : null;
};

export default PassportResources;
