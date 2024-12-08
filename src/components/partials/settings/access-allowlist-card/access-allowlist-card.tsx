import { useAnalytics } from '@components/hooks/use-analytics';
import { AllowListBlockModal } from '@components/partials/settings/access-allowlist-card/allow-list-block-modal';
import { FormCard } from '@components/presentation/form-card';
import { LOCALHOST } from '@constants/allow-list';
import { type App } from '@hooks/data/user/types';
import { isAllowlistTypeBundle, isAllowlistTypeDomain, isAllowlistTypeRedirect } from '@libs/allowlist';
import { containsEmojis } from '@libs/contains-emojis';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { isEmpty } from '@libs/utils';
import { isValidBundle, isValidURL } from '@libs/validator';
import { useToast } from '@magiclabs/ui-components';
import {
  addBatchAllowlist,
  getAllowlisted,
  removeAllowlisted,
  type AllowlistItem,
} from '@services/access-allowlisting';
import { Box } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccessAllowlistEditView } from './access-allow-list-edit-view';
import { AccessAllowlistReadView } from './access-allow-list-read-view';

const DOMAIN_TYPE = 'Domain';
const BUNDLE_TYPE = 'Bundle';
const REDIRECT_TYPE = 'Redirect';

export enum AllowlistEntryType {
  DOMAIN = DOMAIN_TYPE,
  BUNDLE = BUNDLE_TYPE,
  REDIRECT = REDIRECT_TYPE,
}

type Props = {
  app: App;
};

export const AccessAllowlistCard = ({ app }: Props) => {
  const { createToast } = useToast();
  const searchParams = useSearchParams();
  const paramEdit = searchParams?.get('edit');

  const [isReadOnlyViewActive, setIsReadOnlyViewActive] = useState(true);
  const [domainAllowlist, setDomainAllowlist] = useState<string[]>([]);
  const [bundleAllowlist, setBundleAllowlist] = useState<string[]>([]);
  const [redirectAllowlist, setRedirectAllowlist] = useState<string[]>([]);
  const [editedDomainAllowlist, setEditedDomainAllowlist] = useState<string[]>([]);
  const [editedBundleAllowlist, setEditedBundleAllowlist] = useState<string[]>([]);
  const [editedRedirectAllowlist, setEditedRedirectAllowlist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newBundle, setNewBundle] = useState('');
  const [newRedirect, setNewRedirect] = useState('');
  const [newDomainErrorMessage, setNewDomainErrorMessage] = useState('');
  const [newBundleErrorMessage, setNewBundleErrorMessage] = useState('');
  const [newRedirectErrorMessage, setNewRedirectErrorMessage] = useState('');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const { trackAction } = useAnalytics();

  const cardTitle = isDedicatedApp(app.appType) ? 'Allowed Origins & Redirects' : 'Domain API Access';

  const domainAllowlistActions = [
    newDomain,
    editedDomainAllowlist,
    setEditedDomainAllowlist,
    setNewDomainErrorMessage,
    setNewDomain,
  ] as const;

  const bundleAllowlistActions = [
    newBundle,
    editedBundleAllowlist,
    setEditedBundleAllowlist,
    setNewBundleErrorMessage,
    setNewBundle,
  ] as const;

  const redirectAllowlistActions = [
    newRedirect,
    editedRedirectAllowlist,
    setEditedRedirectAllowlist,
    setNewRedirectErrorMessage,
    setNewRedirect,
  ] as const;

  useEffect(() => {
    if (paramEdit) {
      setIsReadOnlyViewActive(false);
    }
  }, [paramEdit]);

  useEffect(() => {
    const setAllowList = async () => {
      const { data } = await getAllowlisted(app.appId);

      if (data) {
        setDomainAllowlist(data.whitelisted_domains);
        setBundleAllowlist(data.whitelisted_bundles);
        setRedirectAllowlist(data.whitelisted_redirect_urls);
        setEditedDomainAllowlist(data.whitelisted_domains);
        setEditedBundleAllowlist(data.whitelisted_bundles);
        setEditedRedirectAllowlist(data.whitelisted_redirect_urls);
      }
    };

    setAllowList();
  }, [app]);

  const addNewEntryToEditedAllowlist = (type: AllowlistEntryType) => {
    let allowlistActionsList:
      | typeof domainAllowlistActions
      | typeof bundleAllowlistActions
      | typeof redirectAllowlistActions;

    switch (type) {
      case AllowlistEntryType.DOMAIN:
        allowlistActionsList = domainAllowlistActions;
        break;
      case AllowlistEntryType.BUNDLE:
        allowlistActionsList = bundleAllowlistActions;
        break;
      default:
      case AllowlistEntryType.REDIRECT:
        allowlistActionsList = redirectAllowlistActions;
        break;
    }

    const [entry, editedAllowlist, setEditedAllowlist, setErrorMessage, setNewEntry] = allowlistActionsList;

    setErrorMessage('');

    if (entry.trim() === '') {
      setErrorMessage(`Specified ${type.toLowerCase()} cannot be blank`);
      return;
    }
    if (containsEmojis(entry)) {
      setErrorMessage('Please only use alphanumeric characters');
      return;
    }
    if (editedAllowlist.some((editedAllowlistEntry) => editedAllowlistEntry === entry)) {
      setErrorMessage(`Specified ${type.toLowerCase()} has already been allowlisted`);
      return;
    }
    const baseErrorMessage = 'Invalid format, please try again. expected format:';
    if ((isAllowlistTypeDomain(type) || isAllowlistTypeRedirect(type)) && !isValidURL(entry)) {
      setErrorMessage(`${baseErrorMessage} https://sub.domain.com${isAllowlistTypeRedirect(type) ? '/callback' : ''}`);
      return;
    }
    if (isAllowlistTypeBundle(type) && !isValidBundle(entry)) {
      setErrorMessage(`${baseErrorMessage} com.example.app`);
      return;
    }

    setEditedAllowlist((prevState) => [...prevState, entry]);
    setNewEntry('');
  };

  const removeEntryFromEditedAllowlist = (entry: string, type: AllowlistEntryType) => {
    switch (type) {
      case AllowlistEntryType.BUNDLE:
        setEditedBundleAllowlist((prevState) => prevState.filter((allowlistEntry) => allowlistEntry !== entry));
        break;
      case AllowlistEntryType.REDIRECT:
        setEditedRedirectAllowlist((prevState) => prevState.filter((allowlistEntry) => allowlistEntry !== entry));
        break;
      case AllowlistEntryType.DOMAIN:
        setEditedDomainAllowlist((prevState) => prevState.filter((allowlistEntry) => allowlistEntry !== entry));
        break;
      default:
        break;
    }
  };

  const saveRemovedAllowlistEntry = async (entry: string, type: AllowlistEntryType) => {
    const { error } = await removeAllowlisted(
      app.appId,
      type.replace(REDIRECT_TYPE, 'redirect_url').toLowerCase(),
      entry,
    );

    if (error) {
      return {
        error: { message: (error as Error).message as string, value: entry },
      };
    }

    trackAction(`Allowlist ${type} Removed`, { entry });

    return { data: entry };
  };

  const saveRemovedAllowlistEntries = async (
    editedAllowlist: string[],
    allowlist: string[],
    type: AllowlistEntryType,
  ) => {
    const removedEntries = allowlist.filter((entry) => !editedAllowlist.includes(entry));
    const saveRemovedEntriesResults = await Promise.all(
      removedEntries.map((entry) => saveRemovedAllowlistEntry(entry, type)),
    );
    const successfulRemovedEntries = saveRemovedEntriesResults
      .filter((result) => result.data)
      .map((result) => result.data);
    const rejectedRemovedEntries = saveRemovedEntriesResults
      .filter((result) => result.error)
      .map((result) => result.error?.value);

    return {
      successfulRemovedEntries,
      rejectedRemovedEntries,
    };
  };

  const saveAllowlistChanges = async () => {
    const sanitizeAllowlist = (
      editedAllowlist: string[],
      allowlist: string[],
      type: AllowlistEntryType,
    ): AllowlistItem[] => {
      const newEntries = editedAllowlist.filter((entry) => !allowlist.includes(entry));
      return newEntries.map((item) => {
        return {
          value: isAllowlistTypeDomain(type) ? item.replace(/\/+$/, '') : item,
          access_type: type.replace(REDIRECT_TYPE, 'redirect_url').toLowerCase(),
        };
      });
    };

    const newAllowlistEntries: AllowlistItem[] = [
      ...sanitizeAllowlist(editedDomainAllowlist, domainAllowlist, AllowlistEntryType.DOMAIN),
      ...sanitizeAllowlist(editedBundleAllowlist, bundleAllowlist, AllowlistEntryType.BUNDLE),
      ...sanitizeAllowlist(editedRedirectAllowlist, redirectAllowlist, AllowlistEntryType.REDIRECT),
    ];

    // Submit newly added and removed entries to server
    const saveEntriesResponses = await Promise.all([
      newAllowlistEntries.length ? addBatchAllowlist(app.appId, newAllowlistEntries) : null,
      saveRemovedAllowlistEntries(editedDomainAllowlist, domainAllowlist, AllowlistEntryType.DOMAIN),
      saveRemovedAllowlistEntries(editedBundleAllowlist, bundleAllowlist, AllowlistEntryType.BUNDLE),
      saveRemovedAllowlistEntries(editedRedirectAllowlist, redirectAllowlist, AllowlistEntryType.REDIRECT),
    ]);

    const batchAddResponse = saveEntriesResponses[0];

    const successfulRemovedEntries = [
      ...saveEntriesResponses[1].successfulRemovedEntries,
      ...saveEntriesResponses[2].successfulRemovedEntries,
      ...saveEntriesResponses[3].successfulRemovedEntries,
    ];
    const rejectedRemovedEntries = [
      ...saveEntriesResponses[1].rejectedRemovedEntries,
      ...saveEntriesResponses[2].rejectedRemovedEntries,
      ...saveEntriesResponses[3].rejectedRemovedEntries,
    ];

    if (batchAddResponse?.data || !isEmpty(successfulRemovedEntries)) {
      createToast({
        message: 'Your allowlist has been updated',
        variant: 'success',
        lifespan: 5000,
      });
    }

    if (batchAddResponse && !isEmpty(batchAddResponse.error)) {
      createToast({
        message: 'There was an error trying to add new domains',
        variant: 'error',
        lifespan: 5000,
      });
    }

    if (!isEmpty(rejectedRemovedEntries)) {
      createToast({
        message: `There was an error trying to remove some entries: ${rejectedRemovedEntries.join(', ')}`,
        variant: 'error',
        lifespan: 5000,
      });
    }

    // Pull the latest data from the server
    const { data } = await getAllowlisted(app.appId);
    if (data) {
      const { whitelisted_domains, whitelisted_bundles, whitelisted_redirect_urls } = data;

      setDomainAllowlist(whitelisted_domains);
      setBundleAllowlist(whitelisted_bundles);
      setRedirectAllowlist(whitelisted_redirect_urls);
      setEditedDomainAllowlist(whitelisted_domains);
      setEditedBundleAllowlist(whitelisted_bundles);
      setEditedRedirectAllowlist(whitelisted_redirect_urls);
    }

    setIsBlockModalOpen(false);
    setIsReadOnlyViewActive(true);
    setNewBundleErrorMessage('');
    setNewDomainErrorMessage('');
    setNewRedirectErrorMessage('');
    setNewBundle('');
    setNewDomain('');
    setNewRedirect('');
  };

  const checkIfBlockModalShouldPopup = () => {
    const concatList = editedDomainAllowlist.concat(editedRedirectAllowlist);
    if (concatList.length && concatList.every((e) => e.includes(LOCALHOST))) {
      setIsBlockModalOpen(true);
    }
    saveAllowlistChanges();
  };

  const closeEditView = () => {
    setIsReadOnlyViewActive(true);
    setEditedDomainAllowlist(domainAllowlist);
    setEditedBundleAllowlist(bundleAllowlist);
    setEditedRedirectAllowlist(redirectAllowlist);
    setNewBundleErrorMessage('');
    setNewDomainErrorMessage('');
    setNewRedirectErrorMessage('');
    setNewBundle('');
    setNewDomain('');
    setNewRedirect('');
  };

  const [isFormValid, setIsFormValid] = useState(true);

  return (
    // anchor link offset hack
    <Box id="card-access-allowlist" pt="5.5rem" mt="-5.5rem">
      <FormCard
        title={cardTitle}
        onEdit={() => setIsReadOnlyViewActive(false)}
        onSave={checkIfBlockModalShouldPopup}
        onCancel={closeEditView}
        isReadOnlyView={isReadOnlyViewActive}
        readonlyView={
          <AccessAllowlistReadView
            bundleAllowlist={bundleAllowlist}
            domainAllowlist={domainAllowlist}
            redirectAllowlist={redirectAllowlist}
          />
        }
        editView={
          <AccessAllowlistEditView
            app={app}
            addNewEntryToEditedAllowlist={addNewEntryToEditedAllowlist}
            editedBundleAllowlist={editedBundleAllowlist}
            editedDomainAllowlist={editedDomainAllowlist}
            editedRedirectAllowlist={editedRedirectAllowlist}
            newBundle={newBundle}
            newDomain={newDomain}
            newRedirect={newRedirect}
            newBundleErrorMessage={newBundleErrorMessage}
            newDomainErrorMessage={newDomainErrorMessage}
            newRedirectErrorMessage={newRedirectErrorMessage}
            onChangeNewBundle={setNewBundle}
            onChangeNewDomain={setNewDomain}
            onChangeNewRedirect={setNewRedirect}
            removeEntryFromEditedAllowlist={removeEntryFromEditedAllowlist}
            setIsFormValid={setIsFormValid}
          />
        }
        isFormValid={isFormValid}
      />
      <AllowListBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={saveAllowlistChanges}
      />
    </Box>
  );
};
