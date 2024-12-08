import { AllowlistEntryType } from '@components/partials/settings/access-allowlist-card/access-allowlist-card';
import { AllowListEntryRemoveModal } from '@components/partials/settings/access-allowlist-card/allow-list-entry-remove-modal';
import { AllowlistToggle } from '@components/partials/settings/access-allowlist-card/allow-list-toggle';
import { DOMAINS_TAB, MOBILE_APPS_TAB, REDIRECTS_TAB } from '@constants/allow-list';
import { type App } from '@hooks/data/user/types';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import {
  magicDocsBundleAllowlistLink,
  magicDocsDomainAllowlistLink,
  magicDocsRedirectAllowlistLink,
} from '@libs/link-resolvers';
import { isEmpty } from '@libs/utils';
import { Button, Text, TextInput } from '@magiclabs/ui-components';
import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import { css } from '@styled/css';
import { Box, Divider, Flex, HStack, Stack } from '@styled/jsx';
import { flex } from '@styled/patterns';
import { useCallback, useEffect, useState, type FC, type SetStateAction } from 'react';

interface AccessAllowlistEditViewProps {
  app: App;
  addNewEntryToEditedAllowlist: (type: AllowlistEntryType) => void;
  editedBundleAllowlist: string[];
  editedDomainAllowlist: string[];
  editedRedirectAllowlist: string[];
  newBundle: string;
  newDomain: string;
  newRedirect: string;
  newBundleErrorMessage: string;
  newDomainErrorMessage: string;
  newRedirectErrorMessage: string;
  onChangeNewBundle: (value: string) => void;
  onChangeNewDomain: (value: string) => void;
  onChangeNewRedirect: (value: string) => void;
  removeEntryFromEditedAllowlist: (entry: string, type: AllowlistEntryType) => void;
  setIsFormValid: (value: boolean) => void;
}

const defaultTabs: string[] = [DOMAINS_TAB, REDIRECTS_TAB, MOBILE_APPS_TAB];

type AllowEntryInput = {
  errorMessage: string;
  onChange: (domain: string) => void;
  newValue: string;
  onAdd: (type: AllowlistEntryType) => void;
  onRemove: (entry: string, type: AllowlistEntryType) => void;
  allowlist: string[];
  placeholder: string;
  children?: JSX.Element | string;
  type: AllowlistEntryType;
};

const AllowEntriesAndInput = ({
  errorMessage,
  onChange,
  newValue,
  onAdd,
  onRemove,
  allowlist,
  placeholder,
  children,
  type,
}: AllowEntryInput) => {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState({} as { entry: string; type: AllowlistEntryType });

  const removeWithModal = (entry: string, entryType: AllowlistEntryType) => {
    setIsRemoveModalOpen(true);
    setSelectedEntry({ entry, type: entryType });
  };

  const onConfirm = useCallback(() => {
    onRemove(selectedEntry.entry, selectedEntry.type);
    setIsRemoveModalOpen(false);
  }, [onRemove, selectedEntry]);

  return (
    <>
      <HStack mt={6} gap={4}>
        <TextInput
          errorMessage={errorMessage}
          onChange={(value) => onChange(value)}
          placeholder={placeholder}
          value={newValue}
          className={css({ flex: 1 })}
          aria-label="Allowlist input"
        />
        <Button
          variant="secondary"
          label={`Add ${type}`}
          onPress={() => onAdd(type)}
          disabled={newValue.trim() === ''}
        />
      </HStack>
      {children && <Box mt={3}>{children}</Box>}
      <Box mt={6}>
        {allowlist.toReversed().map((value, index) => (
          <Box key={value}>
            {index !== 0 && <Divider my={3} color="neutral.tertiary" />}
            <HStack gap={3} key={value} justifyContent="space-between">
              <Text truncate>{value}</Text>
              <HStack gap={8}>
                <Text fontColor="text.tertiary">{type}</Text>
                <Button
                  variant="text"
                  textStyle="negative"
                  label="Remove"
                  onPress={() => removeWithModal(value, type)}
                />
              </HStack>
            </HStack>
          </Box>
        ))}
      </Box>
      <AllowListEntryRemoveModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={onConfirm}
        entryToBeRemoved={selectedEntry}
      />
    </>
  );
};

export const AccessAllowlistEditView: FC<AccessAllowlistEditViewProps> = ({
  app,
  addNewEntryToEditedAllowlist,
  editedBundleAllowlist,
  editedDomainAllowlist,
  editedRedirectAllowlist,
  newBundle,
  newDomain,
  newRedirect,
  newBundleErrorMessage,
  newDomainErrorMessage,
  newRedirectErrorMessage,
  onChangeNewBundle,
  onChangeNewDomain,
  onChangeNewRedirect,
  removeEntryFromEditedAllowlist,
  setIsFormValid,
}) => {
  const [isDomainAllowlistEnabled, setIsDomainAllowlistEnabled] = useState(false);
  const [isBundleAllowlistEnabled, setIsBundleAllowlistEnabled] = useState(false);
  const [isRedirectAllowlistEnabled, setIsRedirectAllowlistEnabled] = useState(false);

  const [tabs, setTabs] = useState(defaultTabs as Array<string | undefined>);
  const [selectedTab, setSelectedTab] = useState<string | undefined>();

  useEffect(() => {
    if (
      (isDomainAllowlistEnabled && !editedDomainAllowlist.length) ||
      (isBundleAllowlistEnabled && !editedBundleAllowlist.length) ||
      (isRedirectAllowlistEnabled && !editedRedirectAllowlist.length)
    ) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [
    isDomainAllowlistEnabled,
    isBundleAllowlistEnabled,
    isRedirectAllowlistEnabled,
    editedDomainAllowlist.length,
    editedBundleAllowlist.length,
    editedRedirectAllowlist.length,
    setIsFormValid,
  ]);

  useEffect(() => {
    const tabList = [];
    if (!isEmpty(editedDomainAllowlist)) {
      setIsDomainAllowlistEnabled(true);
      tabList[0] = DOMAINS_TAB;
    }
    if (!isEmpty(editedRedirectAllowlist)) {
      setIsRedirectAllowlistEnabled(true);
      tabList[1] = REDIRECTS_TAB;
    }
    if (!isEmpty(editedBundleAllowlist)) {
      setIsBundleAllowlistEnabled(true);
      tabList[2] = MOBILE_APPS_TAB;
    }

    setTabs(tabList);
    if (!selectedTab) {
      setSelectedTab(tabList.find((el) => el));
    }
  }, [editedBundleAllowlist, editedDomainAllowlist, editedRedirectAllowlist]);

  const handleAllowlistToggled = useCallback(
    (tab: string, handler: (value: SetStateAction<boolean>) => void) => () => {
      handler((prevState) => {
        const index = defaultTabs.indexOf(tab);
        // Enable
        if (!prevState) {
          tabs[index] = tab;
          setSelectedTab(tab);
        }
        // Disable
        if (prevState) {
          tabs[index] = undefined;
          if (selectedTab === tab) {
            const newDefaultTab = tabs.find((el) => el);
            setSelectedTab(newDefaultTab);
          }
        }
        setTabs(tabs);
        return !prevState;
      });
    },
    [tabs, selectedTab],
  );

  return (
    <Stack gap={0}>
      <Stack gap={3}>
        <Text size="lg" fontWeight="medium">
          Active Allowlists
        </Text>
        <Text fontColor="text.tertiary">
          To prevent unauthorized usage of your API key, all relevant allowlists should be enabled based on your
          platform and use case. Learn more in our{' '}
          <a {...magicDocsDomainAllowlistLink} className={css({ color: 'brand.base', fontWeight: 600 })}>
            docs
          </a>
          .
        </Text>
      </Stack>

      <Flex mdDown={{ flexDirection: 'column' }} gap={3} mt={6}>
        {/* Domain Allowlist */}
        <AllowlistToggle
          header="Domain"
          tooltip={
            <>
              Domain allowlist permits only certain domains to use this app&apos;s API Keys.
              <br />
              <br />
              Turn off to allow all domains.
            </>
          }
          enabled={isDomainAllowlistEnabled}
          onPress={handleAllowlistToggled(DOMAINS_TAB, setIsDomainAllowlistEnabled)}
          allowlist={editedDomainAllowlist}
        />
        {/* Mobile App Allowlist */}
        {isDedicatedApp(app.appType) && (
          <AllowlistToggle
            header="Redirect"
            tooltip={
              <>
                Redirect allowlist permits redirect URLs to be used for a redirect based auth flow. This includes oauth
                and magic link login using `redirectURI`.
              </>
            }
            enabled={isRedirectAllowlistEnabled}
            onPress={handleAllowlistToggled(REDIRECTS_TAB, setIsRedirectAllowlistEnabled)}
            allowlist={editedRedirectAllowlist}
          />
        )}
        {/* Redirect Allowlist */}
        {isDedicatedApp(app.appType) && (
          <AllowlistToggle
            header="Mobile App"
            tooltip={
              <>
                Allowlist mobile app based on bundle ID (iOS) or package name (Android).
                <br />
                <br />
                Turn off to allow all apps.
              </>
            }
            enabled={isBundleAllowlistEnabled}
            onPress={handleAllowlistToggled(MOBILE_APPS_TAB, setIsBundleAllowlistEnabled)}
            allowlist={editedBundleAllowlist}
          />
        )}
      </Flex>

      {/*Allowlist Entries*/}
      {(isDomainAllowlistEnabled || isBundleAllowlistEnabled || isRedirectAllowlistEnabled) && (
        <>
          <Divider color="neutral.tertiary" my={8} />
          <Stack gap={6}>
            <Text size="lg" fontWeight="medium">
              Allowlist Entries
            </Text>
            <Root defaultValue={selectedTab} onValueChange={(value) => setSelectedTab(value)} value={selectedTab}>
              <List
                aria-controls="tabs"
                className={flex({ pb: 3, borderBottomWidth: 'thin', borderColor: 'neutral.tertiary' })}
              >
                {tabs.map((key) => {
                  const isSelected = selectedTab === key;
                  return (
                    key && (
                      <Trigger
                        key={key}
                        value={key}
                        className={css({
                          color: isSelected ? 'brand.base' : 'text.secondary',
                          cursor: 'pointer',
                          mr: 8,
                          fontWeight: isSelected ? 'bold' : 500,
                          position: 'relative',
                          _before: {
                            content: isSelected ? '""' : 'none',
                            position: 'absolute',
                            bottom: '-0.75rem',
                            left: 0,
                            w: 'full',
                            height: 1,
                            bg: 'brand.base',
                            transition: 'all 0.3s ease-in-out',
                            roundedTop: '6.25rem',
                          },
                        })}
                      >
                        {key}
                      </Trigger>
                    )
                  );
                })}
              </List>
              <Content value={DOMAINS_TAB}>
                <AllowEntriesAndInput
                  errorMessage={newDomainErrorMessage}
                  onChange={onChangeNewDomain}
                  newValue={newDomain}
                  onAdd={addNewEntryToEditedAllowlist}
                  onRemove={removeEntryFromEditedAllowlist}
                  allowlist={editedDomainAllowlist}
                  placeholder="https://example.com"
                  type={AllowlistEntryType.DOMAIN}
                >
                  <Text fontColor="text.tertiary">
                    <a className={css({ color: 'brand.base', fontWeight: 600 })} {...magicDocsDomainAllowlistLink}>
                      View docs
                    </a>{' '}
                    for formatting and API-based configuration details
                  </Text>
                </AllowEntriesAndInput>
              </Content>
              <Content value={MOBILE_APPS_TAB}>
                <AllowEntriesAndInput
                  errorMessage={newBundleErrorMessage}
                  onChange={onChangeNewBundle}
                  newValue={newBundle}
                  onAdd={addNewEntryToEditedAllowlist}
                  onRemove={removeEntryFromEditedAllowlist}
                  allowlist={editedBundleAllowlist}
                  placeholder="com.company.app"
                  type={AllowlistEntryType.BUNDLE}
                >
                  <Text fontColor="text.tertiary">
                    Enter a bundle ID (iOS) or package name (Android).{' '}
                    <a className={css({ color: 'brand.base', fontWeight: 600 })} {...magicDocsBundleAllowlistLink}>
                      View docs
                    </a>{' '}
                    for more info.
                  </Text>
                </AllowEntriesAndInput>
              </Content>
              <Content value={REDIRECTS_TAB}>
                <AllowEntriesAndInput
                  errorMessage={newRedirectErrorMessage}
                  onChange={onChangeNewRedirect}
                  newValue={newRedirect}
                  onAdd={addNewEntryToEditedAllowlist}
                  onRemove={removeEntryFromEditedAllowlist}
                  allowlist={editedRedirectAllowlist}
                  placeholder="example://"
                  type={AllowlistEntryType.REDIRECT}
                >
                  <Text fontColor="text.tertiary">
                    <a className={css({ color: 'brand.base', fontWeight: 600 })} {...magicDocsRedirectAllowlistLink}>
                      View docs
                    </a>{' '}
                    for formatting and API-based configuration details
                  </Text>
                </AllowEntriesAndInput>
              </Content>
            </Root>
          </Stack>
        </>
      )}
    </Stack>
  );
};
