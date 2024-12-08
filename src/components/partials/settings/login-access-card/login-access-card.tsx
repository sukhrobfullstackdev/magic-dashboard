import { useAnalytics } from '@components/hooks/use-analytics';
import { TextArea } from '@components/inputs/text-area';
import { AccessListModal } from '@components/partials/settings/access-list-modal';
import { InvalidEntriesModal } from '@components/partials/settings/invalid-entries-modal';
import { FormCard } from '@components/presentation/form-card';
import { Button, Callout, IcoQuestionCircleFill, Switch, Text, Tooltip, useToast } from '@magiclabs/ui-components';
import { getAccessLists, updateAccessLists, validateAccessLists } from '@services/login-access';
import { css } from '@styled/css';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState, type FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { v4 as createUuid } from 'uuid';

const MAX_ACCESS_LIST_SIZE = 20000;

const AccessListStringToArray = (accessListString: string) => {
  return accessListString
    ? accessListString
        .replace(/\s+/g, ',') // replace spaces
        .replace(/\n/g, ',') // replace newlines
        .split(',')
        .filter((a) => Boolean(a))
    : [];
};

interface AllowListEditorProps {
  isAllowListConfigured: boolean;
  setIsAllowListConfigured: (isConfigured: boolean) => void;
  allowListString: string;
  setAllowListString: (allowListString: string) => void;
  allowListValidationError: string;
  setAllowListValidationError: (errorMessage: string) => void;
}

const AllowListEditor: FC<AllowListEditorProps> = ({
  isAllowListConfigured,
  setIsAllowListConfigured,
  allowListString,
  setAllowListString,
  allowListValidationError,
  setAllowListValidationError,
}) => {
  return (
    <Stack gap={4}>
      <HStack justifyContent="space-between">
        <HStack gap={2}>
          Allow List
          <Tooltip
            content={
              <Text inline size="sm" fontColor="text.tertiary">
                Limit login access to users with specific email addresses or domains.
              </Text>
            }
          >
            <IcoQuestionCircleFill color={token('colors.neutral.primary')} height={18} width={18} />
          </Tooltip>
        </HStack>

        <Switch
          disabled={false}
          onPress={() => setIsAllowListConfigured(!isAllowListConfigured)}
          checked={isAllowListConfigured}
        />
      </HStack>
      {isAllowListConfigured && (
        <>
          <TextArea
            height="100px"
            placeholder="example@gmail.com, *@domain.com, etc. Separate with commas or line breaks."
            value={allowListString}
            onChange={(e) => {
              setAllowListString(e.target.value);
              setAllowListValidationError('');
            }}
            errorMessage={allowListValidationError}
            spellCheck={false}
            resize="vertical"
          />
          <Callout icon variant="warning" label="Only the users on your Allow List will be able to sign up or log in" />
        </>
      )}
    </Stack>
  );
};

interface BlockListEditorProps {
  isBlockListConfigured: boolean;
  setIsBlockListConfigured: (isConfigured: boolean) => void;
  blockListString: string;
  setBlockListString: (allowListString: string) => void;
  blockListValidationError: string;
  setBlockListValidationError: (errorMessage: string) => void;
}

const BlockListEditor: FC<BlockListEditorProps> = ({
  isBlockListConfigured,
  setIsBlockListConfigured,
  blockListString,
  setBlockListString,
  blockListValidationError,
  setBlockListValidationError,
}) => {
  return (
    <Stack gap={4}>
      <HStack justifyContent="space-between">
        <HStack gap={2}>
          Block List
          <Tooltip
            content={
              <Text inline size="sm" fontColor="text.tertiary">
                Block specific email addresses or domains from login. Overrides Allow List entries.
              </Text>
            }
          >
            <IcoQuestionCircleFill color={token('colors.neutral.primary')} height={18} width={18} />
          </Tooltip>
        </HStack>
        <Switch
          disabled={false}
          onPress={() => setIsBlockListConfigured(!isBlockListConfigured)}
          checked={isBlockListConfigured}
        />
      </HStack>
      {isBlockListConfigured && (
        <>
          <TextArea
            height="100px"
            placeholder="example@gmail.com, *@domain.com, etc. Separate with commas or line breaks."
            value={blockListString}
            onChange={(e) => {
              setBlockListString(e.target.value);
              setBlockListValidationError('');
            }}
            errorMessage={blockListValidationError}
            resize="vertical"
          />
        </>
      )}
    </Stack>
  );
};

type Props = {
  appId: string;
};

export const LoginAccessCard = ({ appId }: Props) => {
  const { createToast } = useToast();

  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [hasRetrievedAccessListData, setHasRetrievedAccessListData] = useState(false);

  const [allowListString, setAllowListString] = useState(''); // Use string for performance reasons.
  const [blockListString, setBlockListString] = useState(''); // Use string for performance reasons.

  const [isAllowListConfigured, setIsAllowListConfigured] = useState(false);
  const [isBlockListConfigured, setIsBlockListConfigured] = useState(false);

  const [allowListValidationError, setAllowListValidationError] = useState('');
  const [blockListValidationError, setBlockListValidationError] = useState('');

  const [showInvalidEntriesModal, setShowInvalidEntriesModal] = useState(false);

  const [showAllowAccessListModal, setShowAllowAccessListModal] = useState(false);
  const [showBlockAccessListModal, setShowBlockAccessListModal] = useState(false);

  const [invalidAllowListEmails, setInvalidAllowListEmails] = useState<string[]>([]); // Populated onSave
  const [invalidBlockListEmails, setInvalidBlockListEmails] = useState<string[]>([]); // Populated onSave

  const { trackAction } = useAnalytics();

  const initAllowListBlockListInfo = useCallback(
    async (wasUpdated?: boolean) => {
      if (appId) {
        setHasRetrievedAccessListData(false);
        const res = await getAccessLists(appId);

        setAllowListString(res?.emails?.allow_list?.join(', '));
        setBlockListString(res?.emails?.block_list?.join(', '));
        setIsAllowListConfigured(res?.emails.allow_list.length > 0);
        setIsBlockListConfigured(res?.emails.block_list.length > 0);
        setHasRetrievedAccessListData(true);

        if (wasUpdated) {
          trackAction('Access Lists Updated', {
            totalAllowListEntries: res?.emails?.allow_list?.length,
            totalBlockListEntries: res?.emails?.block_list?.length,
          });
        }
      }
    },
    [appId, trackAction],
  );

  useEffect(() => {
    initAllowListBlockListInfo();
  }, [appId, initAllowListBlockListInfo]);

  // This is the function that cannot be useCallbacked for what ever reason.
  const persistAccessLists = async () => {
    const al = AccessListStringToArray(allowListString);
    const bl = AccessListStringToArray(blockListString);
    await updateAccessLists(appId, isAllowListConfigured ? al : [], isBlockListConfigured ? bl : []);

    createToast({
      message: 'Updates will take effect shortly',
      variant: 'success',
      lifespan: 5000,
    });

    initAllowListBlockListInfo(true);
    setIsReadOnlyView(true);
    setInvalidAllowListEmails([]);
    setInvalidBlockListEmails([]);
  };

  // This is also a function that cannot be useCallbacked for what ever reason.
  const onSave = async () => {
    let hasValidationError = false;

    setAllowListValidationError('');
    setBlockListValidationError('');

    const allowList = AccessListStringToArray(allowListString);
    const blockList = AccessListStringToArray(blockListString);

    if (allowList.length > MAX_ACCESS_LIST_SIZE || blockList.length > MAX_ACCESS_LIST_SIZE) {
      if (allowList.length > MAX_ACCESS_LIST_SIZE) {
        setAllowListValidationError(
          `Lists cannot exceed ${MAX_ACCESS_LIST_SIZE.toLocaleString('en-US')} entries. Please remove ${(
            allowList.length - MAX_ACCESS_LIST_SIZE
          ).toLocaleString('en-US')} entries.`,
        );
        hasValidationError = true;
      }
      if (blockList.length > MAX_ACCESS_LIST_SIZE) {
        setBlockListValidationError(
          `Lists cannot exceed ${MAX_ACCESS_LIST_SIZE.toLocaleString('en-US')} entries. Please remove ${(
            blockList.length - MAX_ACCESS_LIST_SIZE
          ).toLocaleString('en-US')} entries.`,
        );
        hasValidationError = true;
      }
    } else {
      const res = await validateAccessLists(appId, allowList, blockList);
      const iale = res?.invalid_emails?.allow_list ?? [];
      const ible = res?.invalid_emails?.block_list ?? [];
      setInvalidAllowListEmails(iale);
      setInvalidBlockListEmails(ible);
      if (allowList.length > 1 || blockList.length > 1) {
        if (iale.length === 0 && ible.length === 0) {
          await persistAccessLists();
        } else {
          setShowInvalidEntriesModal(true);
        }
        return;
      }
      if (allowList.length === 1 && iale.length > 0) {
        setAllowListValidationError('Must be a valid email address or domain (example@domain.com or *@domain.com)');
        hasValidationError = true;
      }
      if (blockList.length === 1 && ible.length > 0) {
        setBlockListValidationError('Must be a valid email address or domain (example@domain.com or *@domain.com)');
        hasValidationError = true;
      }
    }

    if (hasValidationError) return;

    await persistAccessLists();
  };

  const cancelEdit = useCallback(async () => {
    await initAllowListBlockListInfo();
    setIsReadOnlyView(true);
  }, []);

  return (
    <Box id="card-access-control">
      <FormCard
        title="Access Control"
        onEdit={() => setIsReadOnlyView(false)}
        onSave={onSave}
        onCancel={cancelEdit}
        isReadOnlyView={isReadOnlyView}
        isFormValid
        readonlyView={
          <>
            {hasRetrievedAccessListData && !allowListString && !blockListString ? (
              <Text fontColor="text.tertiary">Your app is available to all users</Text>
            ) : (
              <Flex>
                <Stack flex={1} gap={2} key="allowList">
                  <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
                    Allow List
                  </Text>
                  {!hasRetrievedAccessListData ? (
                    <Skeleton width={150} height={25} />
                  ) : (
                    <>
                      {AccessListStringToArray(allowListString)
                        .slice(0, 4)
                        .map((item) => (
                          <Text key={createUuid()}>{item}</Text>
                        ))}
                    </>
                  )}
                  {AccessListStringToArray(allowListString).length > 4 && (
                    <Box>
                      <Button
                        variant="text"
                        label={`+${AccessListStringToArray(allowListString)?.length - 4} more`}
                        onPress={() => setShowAllowAccessListModal(true)}
                      />
                    </Box>
                  )}
                </Stack>
                <Stack flex={1} gap={2} key="blockList">
                  <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
                    Block List
                  </Text>
                  {!hasRetrievedAccessListData ? (
                    <Skeleton width={150} height={25} />
                  ) : (
                    <>
                      {AccessListStringToArray(blockListString)
                        .slice(0, 4)
                        .map((item) => (
                          <Text key={createUuid()}>{item}</Text>
                        ))}
                    </>
                  )}
                  {AccessListStringToArray(blockListString).length > 4 && (
                    <Box>
                      <Button
                        variant="text"
                        label={`+${AccessListStringToArray(blockListString)?.length - 4} more`}
                        onPress={() => setShowBlockAccessListModal(true)}
                      />
                    </Box>
                  )}
                </Stack>
              </Flex>
            )}
          </>
        }
        editView={
          <Stack gap={8}>
            <Box maxW="32.75rem">
              <Text fontColor="text.tertiary">
                Control which users have access to your app. Lists are compatible with email and most Social Login
                providers.{' '}
                <a
                  className={css({ color: 'brand.base', fontWeight: 600 })}
                  href="https://magic.link/docs/customization/access-control"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More
                </a>
              </Text>
            </Box>
            <AllowListEditor
              isAllowListConfigured={isAllowListConfigured}
              setIsAllowListConfigured={setIsAllowListConfigured}
              allowListString={allowListString}
              setAllowListString={setAllowListString}
              allowListValidationError={allowListValidationError}
              setAllowListValidationError={setAllowListValidationError}
            />
            <BlockListEditor
              isBlockListConfigured={isBlockListConfigured}
              setIsBlockListConfigured={setIsBlockListConfigured}
              blockListString={blockListString}
              setBlockListString={setBlockListString}
              blockListValidationError={blockListValidationError}
              setBlockListValidationError={setBlockListValidationError}
            />
          </Stack>
        }
      />
      {showInvalidEntriesModal && (
        <InvalidEntriesModal
          showInvalidEntriesModal={showInvalidEntriesModal}
          setShowInvalidEntriesModal={setShowInvalidEntriesModal}
          invalidAllowListEmails={invalidAllowListEmails}
          invalidBlockListEmails={invalidBlockListEmails}
          persistAccessLists={persistAccessLists}
        />
      )}
      {showAllowAccessListModal && (
        <AccessListModal
          showAccessListModal={showAllowAccessListModal}
          dismissModal={() => setShowAllowAccessListModal(false)}
          accessList={AccessListStringToArray(allowListString)}
          type="allow"
        />
      )}
      {showBlockAccessListModal && (
        <AccessListModal
          showAccessListModal={showBlockAccessListModal}
          dismissModal={() => setShowBlockAccessListModal(false)}
          accessList={AccessListStringToArray(blockListString)}
          type="block"
        />
      )}
    </Box>
  );
};
