import { AllowlistEntryType } from '@components/partials/settings/access-allowlist-card/access-allowlist-card';
import { LOCALHOST } from '@constants/allow-list';
import { magicDocsDomainAllowlistLink } from '@libs/link-resolvers';
import { isEmpty } from '@libs/utils';
import { Button, Callout, Text } from '@magiclabs/ui-components';
import { Flex, HStack, Stack } from '@styled/jsx';
import { useState, type FC } from 'react';

interface AccessAllowlistReadViewProps {
  bundleAllowlist: string[];
  domainAllowlist: string[];
  redirectAllowlist: string[];
}

const handleCalloutPress = () => {
  window.open(magicDocsDomainAllowlistLink.href, '_blank', 'noreferrer');
};

const AllowListItem = ({ value, type }: { value: string; type: AllowlistEntryType }) => {
  return (
    <HStack gap={3} key={value} justifyContent="space-between">
      <Text truncate>{value}</Text>
      <Text fontColor="text.tertiary">{type}</Text>
    </HStack>
  );
};

export const AccessAllowlistReadView: FC<AccessAllowlistReadViewProps> = ({
  bundleAllowlist,
  domainAllowlist,
  redirectAllowlist,
}) => {
  const [isShowMore, setIsShowMore] = useState(false);

  const formattedBundledAllowlist =
    bundleAllowlist && Array.isArray(bundleAllowlist) && bundleAllowlist.length > 0
      ? bundleAllowlist.toReversed().map((value) => {
          return { entry: value, type: AllowlistEntryType.BUNDLE };
        })
      : [];

  const formattedRedirectAllowlist =
    redirectAllowlist && Array.isArray(redirectAllowlist) && redirectAllowlist.length > 0
      ? redirectAllowlist.toReversed().map((value) => {
          return { entry: value, type: AllowlistEntryType.REDIRECT };
        })
      : [];

  const formattedDomainAllowlist =
    domainAllowlist && Array.isArray(domainAllowlist) && domainAllowlist.length > 0
      ? domainAllowlist.toReversed().map((value) => {
          return { entry: value, type: AllowlistEntryType.DOMAIN };
        })
      : [];

  const domainAndBundleAllowlist = formattedDomainAllowlist.concat(formattedBundledAllowlist);

  const concatAllowlist = domainAndBundleAllowlist.concat(formattedRedirectAllowlist);

  const isDomainOrBundleLocalhost =
    !isEmpty(domainAndBundleAllowlist) &&
    domainAndBundleAllowlist.every((item) => {
      return item.entry.includes(LOCALHOST);
    });

  return (
    <Stack gap={6}>
      {isEmpty(domainAndBundleAllowlist) && (
        <Callout
          icon
          variant="warning"
          label="Your API key is vulnerable. Enable relevant allowlists to protect its usage. Learn more"
          onPress={handleCalloutPress}
        />
      )}
      {isDomainOrBundleLocalhost && (
        <Callout
          icon
          variant="warning"
          label="To use your API key outside of a local environment, configure an allowlist for all approved domains and mobile apps. Learn More"
          onPress={handleCalloutPress}
        />
      )}
      <Flex gap={4} flexWrap="wrap">
        <Stack gap={3} w="full">
          {concatAllowlist.slice(0, 6).map((value) => (
            <AllowListItem value={value.entry} type={value.type} key={value.entry} />
          ))}
          {concatAllowlist.length > 6 && !isShowMore && (
            <Flex>
              <Button
                variant="text"
                label={`+${concatAllowlist.length - 6} more`}
                onPress={() => setIsShowMore(true)}
              />
            </Flex>
          )}
          {isShowMore &&
            concatAllowlist
              .slice(6)
              .map((value) => <AllowListItem value={value.entry} type={value.type} key={value.entry} />)}
        </Stack>
      </Flex>
    </Stack>
  );
};
