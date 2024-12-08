import { type CSPEntry } from '@components/partials/settings/content-security-policy-card/types';
import { FormCard } from '@components/presentation/form-card';
import { AppType } from '@constants/appInfo';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { isValidURL } from '@libs/validator';
import { Button, IcoWarningFill, Text, TextInput } from '@magiclabs/ui-components';
import * as CSPService from '@services/content-security-policy';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { useEffect, useState } from 'react';

const CSP_INFO_LINK = 'https://magic.link/docs/wallets/security/content-security-policy';

type Props = {
  app_type: AppType;
  magic_client_id: string;
};

type URLInputProps = {
  newEntry: string;
  updateNewEntry: (value: string) => void;
  saveEntry: () => void;
  inputError: string;
};

const URLInput = ({ newEntry, updateNewEntry, saveEntry, inputError }: URLInputProps) => {
  return (
    <HStack w="full" justifyContent="space-between" gap={4}>
      <Box w="full" flex={1}>
        <TextInput
          name="new_csp"
          value={newEntry}
          errorMessage={inputError}
          onChange={updateNewEntry}
          placeholder="https://api.example.com"
          aria-label="New CSP entry"
        />
      </Box>
      <Button label="Add" onPress={saveEntry} disabled={!newEntry} />
    </HStack>
  );
};

export const ContentSecurityPolicyCard = ({ app_type, magic_client_id }: Props) => {
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [condemnedEntryId, setCondemnedEntryId] = useState('');
  const [entries, setEntries] = useState<CSPEntry[]>([]);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    const fetchCSPEntries = async () => {
      if (!magic_client_id) return;
      const cspEntries = await CSPService.getCSPEntries(magic_client_id);

      setEntries(cspEntries || []);
    };

    fetchCSPEntries();
  }, [magic_client_id]);

  const updateNewEntry = (value: string) => {
    setInputError('');
    setNewEntry(value);
  };

  const saveEntry = async () => {
    const isValid = isValidURL(newEntry.trim());

    if (!isValid) {
      setInputError('Please enter valid URL');
      return;
    }

    try {
      await CSPService.addCSPEntry(magic_client_id!, newEntry.trim());
      const cspEntries = await CSPService.getCSPEntries(magic_client_id!);
      setEntries(cspEntries);
      setNewEntry('');
    } catch (e: unknown) {
      setInputError((e as Error).message);
    }
  };

  const confirmDeleteEntry = async (id: string) => {
    await CSPService.removeCSPEntry(magic_client_id!, id);

    const cspEntries = await CSPService.getCSPEntries(magic_client_id!);

    setEntries(cspEntries);
  };

  const handleDelete = (id: string) => {
    let timer: NodeJS.Timeout | null = null;
    if (timer) clearTimeout(timer);
    if (condemnedEntryId === id) {
      confirmDeleteEntry(id);
      setCondemnedEntryId('');
    } else {
      setCondemnedEntryId(id);
      timer = setTimeout(() => {
        setCondemnedEntryId('');
      }, 3000);
    }
  };

  const readOnlyEntries = (
    <Stack id="card-csp" gap={4}>
      <Text fontColor="text.tertiary" fontWeight="medium">
        Allowlist
      </Text>
      <ul className={stack({ gap: 2 })}>
        {entries.map((entry) => (
          <li key={entry.value}>
            <Text fontWeight="medium" truncate>
              {entry.value}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );

  const customActions = (
    <Button
      variant="text"
      label={isReadOnlyView ? 'Edit' : 'Done'}
      onPress={() =>
        setIsReadOnlyView((isReadOnly) => {
          if (!isReadOnly) {
            setNewEntry('');
          }
          return !isReadOnly;
        })
      }
    />
  );

  const readOnlyInfo = (
    <Box maxW="30rem">
      <Text fontColor="text.tertiary">
        Control which URLs are allowed by the browsers Content Security Policy. Learn more in our{' '}
        <a
          className={css({ color: 'brand.base', fontWeight: 'semibold' })}
          href={CSP_INFO_LINK}
          target="_blank"
          rel="noreferrer"
        >
          docs
        </a>
        .
      </Text>
    </Box>
  );

  const editableCSPCard = (
    <FormCard
      title="Content Security Policy"
      customAction={customActions}
      isReadOnlyView={isReadOnlyView}
      isFormValid
      readonlyView={entries.length ? readOnlyEntries : readOnlyInfo}
      editView={
        <>
          <Box maxW="30rem" mb={6}>
            <Text fontColor="text.tertiary">
              The Content Security Policy (CSP) of a browser dictates what resources can load. You can use the
              connect-src directive to allow specific URLs, such as a custom RPC URL to send transactions to your node.
              Learn more in our{' '}
              <a
                className={css({ color: 'brand.base', fontWeight: 'semibold' })}
                href={CSP_INFO_LINK}
                target="_blank"
                rel="noreferrer"
              >
                docs
              </a>
              .
            </Text>
          </Box>

          <URLInput newEntry={newEntry} updateNewEntry={updateNewEntry} inputError={inputError} saveEntry={saveEntry} />

          <ul className={stack({ gap: 2, mt: 8 })}>
            {entries.map((entry) => (
              <li key={entry.id}>
                <HStack w="full" justifyContent="space-between">
                  <Text fontWeight="medium" truncate>
                    {entry.value}
                  </Text>

                  <Button
                    variant="text"
                    textStyle="negative"
                    label={entry.id === condemnedEntryId ? 'Confirm' : 'Remove'}
                    onPress={() => handleDelete(entry.id)}
                    iconSize={14}
                  >
                    {entry.id === condemnedEntryId && (
                      <Button.LeadingIcon>
                        <IcoWarningFill />
                      </Button.LeadingIcon>
                    )}
                  </Button>
                </HStack>
              </li>
            ))}
          </ul>
        </>
      }
    />
  );

  const informationalCSPCard = (
    <FormCard title="Content Security Policy" isReadOnlyView editable={false} readonlyView={readOnlyInfo} />
  );

  return isDedicatedApp(app_type) ? editableCSPCard : informationalCSPCard;
};
