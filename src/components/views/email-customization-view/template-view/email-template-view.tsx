'use client';

import { html as initializeHtmlLang } from '@codemirror/lang-html';
import {
  STANDARD_MAGIC_LINK_TEMPLATE,
  STANDARD_OTP_TEMPLATE,
} from '@components/views/email-customization-view/template-view/constants';
import { DeleteConfirmationModal } from '@components/views/email-customization-view/template-view/delete-confirmation-modal';
import { TemplatePreview } from '@components/views/email-customization-view/template-view/template-preview';
import { IS_ENV_LOCAL } from '@config';
import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { usePlan } from '@hooks/common/use-plan';
import { useCustomSmtpInfoSuspenseQuery } from '@hooks/data/custom-smtp';
import { customSmtpQueryKeys } from '@hooks/data/custom-smtp/keys';
import { type App } from '@hooks/data/user/types';
import { clipboard } from '@libs/copy';
import {
  Button,
  Callout,
  DropdownOption,
  DropdownSelector,
  IcoCaretLeft,
  IcoCodeEditor,
  IcoExpand,
  IcoExternalLink,
  IcoMinimize,
  Text,
  TextBox,
  TextInput,
  useToast,
} from '@magiclabs/ui-components';
import {
  createCustomMessageTemplateV2,
  createTemplateBindingV2,
  getTemplateBindingsV2,
  templateTestV2,
  updateCustomMessageTemplateV2,
  type MessageTemplateBinding,
  type TemplateUseCase,
} from '@services/custom-message-template-v2';
import { css } from '@styled/css';
import { Box, Flex, HStack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useEmailCustomizationTracking } from '../useEmailCustomizationTracking';
import { sanitizeAndConvertHtml, sanitizeHtml } from '../utils';
import { ActionsMenu } from './actions-menu';
import { autocompleteExtensions } from './autocomplete';
import { PublishConfirmationModal } from './publish-confirmation-modal';
import { TemplateEditorOverlay } from './template-editor-overlay';

const extensions = [initializeHtmlLang(), ...autocompleteExtensions];

declare global {
  interface Window {
    parentTemplate: {
      name?: string;
      emailType?: string;
      subject?: string;
      html?: string;
    };
  }
}

const Resolved = ({ bindingId, app }: { bindingId: string; app: App }) => {
  const [allTemplateBindings, setAllTemplateBindings] = useState<MessageTemplateBinding[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [emailType, setEmailType] = useState<TemplateUseCase>('login_email_otp');
  const [showEmailTypeError, setShowEmailTypeError] = useState(false);
  const [name, setName] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [subject, setSubject] = useState('');
  const [showSubjectError, setShowSubjectError] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(bindingId === 'new_template');
  const [html, setHtml] = useState(bindingId === 'new_template' ? STANDARD_OTP_TEMPLATE : '');
  const [showHtmlError, setShowHtmlError] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [isTogglingFullscreenEditor, setIsTogglingFullscreenEditor] = useState(false);

  const { appId: magic_client_id, appName: app_name } = app;

  const { data: customSmtpInfo } = useCustomSmtpInfoSuspenseQuery(
    customSmtpQueryKeys.info({
      appId: app.appId,
    }),
  );
  const {
    plan: { planName },
  } = usePlan({
    teamId: app.teamId,
  });
  const { track } = useEmailCustomizationTracking();

  const channel = useRef(new BroadcastChannel(`template_preview_${bindingId}`));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createToast } = useToast();

  useEffect(() => {
    const fetchTemplateBindings = async () => {
      const response = await getTemplateBindingsV2(magic_client_id as string);
      setAllTemplateBindings(response?.data || []);

      if (bindingId && !isNewTemplate) {
        const templateBinding = response.data?.find((binding) => binding.id === bindingId);

        if (response.data && templateBinding) {
          const { message_template } = templateBinding;
          setTemplateId(message_template.id);
          setHtml(message_template.raw);
          setSubject(message_template.meta.subject);
          setName(templateBinding.variation);
          setEmailType(templateBinding.use_case);

          track({
            action: 'template viewed',
            data: { templateName: templateBinding.variation, isNewTemplate, isDuplicate: false },
          });
        }
      } else {
        if (searchParams?.get('is_duplicate') && window.opener?.parentTemplate) {
          const {
            name: tName = '',
            emailType: tEmailType = '',
            subject: tSubject = '',
            html: tHtml = '',
          } = window.opener.parentTemplate;
          setName(tName);
          setEmailType(tEmailType as TemplateUseCase);
          setSubject(tSubject);
          setHtml(tHtml);

          track({ action: 'template viewed', data: { templateName: tName, isNewTemplate, isDuplicate: true } });
        } else {
          setSubject('My custom subject line');
          setName('New Template');

          track({ action: 'template viewed', data: { templateName: '', isNewTemplate, isDuplicate: false } });
        }
      }
    };

    fetchTemplateBindings();
  }, []);

  const trimmedName = name.trim();

  const isUniqueName = !allTemplateBindings.find(
    (binding) =>
      binding.message_template_id !== templateId &&
      binding.use_case === emailType &&
      binding.variation.toLowerCase() === trimmedName.toLowerCase(),
  );

  let nameError: string | undefined;
  if (!trimmedName) {
    nameError = 'Field cannot be empty';
  } else if (trimmedName.toLowerCase() === 'default') {
    nameError = 'Template name "default" is reserved';
  } else if (name.length >= 60) {
    nameError = 'Template name must be fewer than 60 characters';
  } else if (!isUniqueName) {
    nameError = 'Template name is already in use';
  }
  const hasCustomSmtp = Boolean(customSmtpInfo);

  const templateVariablesAreValid = () =>
    (emailType === 'login_email_link' && html.search('{{magic_link}}') >= 0) ||
    (emailType === 'login_email_otp' && html.search('{{otp}}') >= 0);

  const isPublishable = () =>
    !nameError &&
    hasCustomSmtp &&
    emailType &&
    html.trim() &&
    templateVariablesAreValid() &&
    subject.trim() &&
    (!isNewTemplate || isUniqueName);

  const IsGrowthOrHigher = planName === PLAN_NAMES.GROWTH || planName === PLAN_NAMES.ENTERPRISE || IS_ENV_LOCAL;

  useEffect(() => {
    const currentChannel = channel.current;
    const handleMessage = () => {
      currentChannel.postMessage({
        html: sanitizeAndConvertHtml(html, app_name),
      });
    };

    handleMessage();
    currentChannel.addEventListener('message', handleMessage);

    return () => {
      currentChannel.removeEventListener('message', handleMessage);
    };
  }, [html, app_name]);

  const toggleFullscreenEditor = () => {
    setIsFullscreenEditor((state) => !state);
    setIsTogglingFullscreenEditor(true);
    setTimeout(() => setIsTogglingFullscreenEditor(false), 500);
  };

  const handleEmailTypeChange = (val: TemplateUseCase) => {
    setShowEmailTypeError(false);
    setEmailType(val);
    setHtml(val === 'login_email_otp' ? STANDARD_OTP_TEMPLATE : STANDARD_MAGIC_LINK_TEMPLATE);
  };

  const handleTemplateValueChange = (val: string) => {
    setShowHtmlError(false);
    setHtml(val);
    channel.current.postMessage({
      html: sanitizeAndConvertHtml(val, app_name),
    });
  };

  const handleTemplateNameChange = (value: string) => {
    setShowNameError(false);
    setName(value);
  };

  const handleSubjectLineChange = (value: string) => {
    setShowSubjectError(false);
    setSubject(value);
  };

  const handleSendTest = async () => {
    setIsSendingTestEmail(true);
    track({ action: 'send test clicked' });
    const result = await templateTestV2(magic_client_id as string, {
      html,
      subject,
      useCase: emailType,
    });

    if (result.error) {
      createToast({
        message: `Error sending test email: ${result.error.message}`,
        variant: 'error',
        lifespan: 5000,
      });
    } else {
      createToast({
        message: 'Test email sent',
        variant: 'success',
        lifespan: 3000,
      });
    }
    setIsSendingTestEmail(false);
  };

  const onClickPublish = () => {
    setIsConfirmationModalOpen(true);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    track({ action: 'save and publish clicked' });
    if (isNewTemplate) {
      const cmtResponse = await createCustomMessageTemplateV2(magic_client_id as string, sanitizeHtml(html), subject);

      if (cmtResponse.data && !cmtResponse.error) {
        const mtbResponse = await createTemplateBindingV2(
          magic_client_id as string,
          cmtResponse.data.id,
          emailType,
          trimmedName,
        );

        createToast({
          message: 'New template created',
          variant: 'success',
          lifespan: 3000,
        });
        setTemplateId(cmtResponse.data.id);

        router.push(`/app/email_customization/${mtbResponse.data?.id}?cid=${magic_client_id}`);

        setIsNewTemplate(false);
      } else {
        createToast({
          message: `Error publishing email updates: ${cmtResponse.error?.message}`,
          variant: 'error',
          lifespan: 5000,
        });
      }
    } else {
      const updateResponse = await updateCustomMessageTemplateV2(magic_client_id as string, {
        templateId,
        html: sanitizeHtml(html),
        subject,
      });

      if (updateResponse.data && !updateResponse.error) {
        createToast({
          message: 'Email updates published',
          variant: 'success',
          lifespan: 3000,
        });
      } else {
        createToast({
          message: `Error publishing email updates: ${updateResponse.error?.message}`,
          variant: 'error',
          lifespan: 5000,
        });
      }
    }

    setIsPublishing(false);
    setIsConfirmationModalOpen(false);
  };

  const invalidTemplateVariablesWarning =
    emailType === 'login_email_link'
      ? 'Magic Link email template must contain {{magic_link}} variable'
      : 'One-Time Password email template must contain {{otp}} variable';

  const handlePublishErrors = () => {
    if (!emailType) {
      setShowEmailTypeError(true);
    }
    if (nameError) {
      setShowNameError(true);
    }
    if (!subject.trim()) {
      setShowSubjectError(true);
    }

    if (!html.trim() || !templateVariablesAreValid()) {
      setShowHtmlError(true);
    }
  };

  const onDuplicate = () => {
    window.parentTemplate = {
      name: `${trimmedName} (Copy)`,
      emailType,
      subject,
      html,
    };
  };

  return (
    <>
      <PublishConfirmationModal
        onConfirm={handlePublish}
        templateName={trimmedName}
        isOpen={isConfirmationModalOpen}
        onCancel={() => setIsConfirmationModalOpen(false)}
      />
      <DeleteConfirmationModal
        onCancel={() => setIsDeleteModalOpen(false)}
        isOpen={isDeleteModalOpen}
        templateName={trimmedName}
        templateId={templateId}
        bindingId={bindingId}
        linesOfHtml={html.trim().split('\n').length}
        magic_client_id={magic_client_id || ''}
      />
      <Flex flexDir="column" p={8}>
        <Box mb={6}>
          <Button
            label="All templates"
            variant="text"
            onPress={() => router.push(`/app/email_customization?cid=${magic_client_id}`)}
          >
            <Button.LeadingIcon>
              <IcoCaretLeft />
            </Button.LeadingIcon>
          </Button>
        </Box>
        <Box bg="surface.primary" maxW="calc(100vw - 304px)" mdDown={{ maxW: 'calc(100vw - 64px)' }} rounded="2xl">
          <Flex>
            <Flex
              flexDir="column"
              w={isFullscreenEditor ? 'full' : '1/2'}
              p={10}
              transition="width 0.3s"
              className={css({
                lgDown: {
                  w: 'full',
                },
              })}
            >
              <HStack justifyContent="space-between" mb={3}>
                <Text.H4>Custom Template</Text.H4>
                <HStack position="relative" alignItems="center" gap={4}>
                  <Link
                    className={hstack({
                      display: isFullscreenEditor ? 'flex' : 'none',
                      lgDown: {
                        display: 'flex',
                      },
                    })}
                    href={`/app/email_customization/preview?id=${bindingId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track({ action: 'template view: preview clicked' })}
                  >
                    <Button size="sm" variant="text" label="Preview">
                      <Button.TrailingIcon>
                        <IcoExternalLink />
                      </Button.TrailingIcon>
                    </Button>
                  </Link>

                  <ActionsMenu
                    id={bindingId}
                    showDelete={!isNewTemplate}
                    onDelete={() => setIsDeleteModalOpen(true)}
                    onDuplicate={onDuplicate}
                  />
                </HStack>
              </HStack>
              <Flex flexDir="column" gap={7}>
                <Text size="sm" fontColor="text.tertiary">
                  Use your template name to send a custom email on login
                </Text>
                <DropdownSelector
                  label="Email type"
                  selectedValue={emailType}
                  aria-label="email type"
                  onSelect={(val) => handleEmailTypeChange(val as TemplateUseCase)}
                  disabled={!isNewTemplate}
                >
                  <DropdownOption value="login_email_otp" label="One-Time Passcode" />
                  <DropdownOption value="login_email_link" label="Magic Link" />
                </DropdownSelector>
                {showEmailTypeError && (
                  <Box mt={2}>
                    <Text size="sm" variant="error">
                      Select an email type
                    </Text>
                  </Box>
                )}
                {isNewTemplate ? (
                  <TextInput
                    name="Template name"
                    label="Template name"
                    value={name}
                    onChange={handleTemplateNameChange}
                    errorMessage={showNameError ? nameError : undefined}
                    disabled={!isNewTemplate}
                  />
                ) : (
                  <Flex direction="column" gap={2.5}>
                    <Text size="sm" fontWeight="medium">
                      Template name
                    </Text>
                    <TextBox content={name} onCopy={clipboard.writeText} />
                  </Flex>
                )}
                <TextInput
                  name="Subject line"
                  label="Subject line"
                  value={subject}
                  onChange={handleSubjectLineChange}
                  errorMessage={showSubjectError ? 'Field cannot be empty' : undefined}
                />
                <Flex flexDir="column" gap={2}>
                  <HStack justifyContent="space-between">
                    <Text size="sm" fontWeight="medium">
                      Template
                    </Text>
                    <Link
                      href="https://magic.link/docs/authentication/customization/custom-email-template"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="text" label="Docs">
                        <Button.LeadingIcon>
                          <IcoCodeEditor />
                        </Button.LeadingIcon>
                      </Button>
                    </Link>
                  </HStack>
                  <Box position="relative" rounded="2xl">
                    {!IsGrowthOrHigher && (
                      <>
                        <Box
                          h="full"
                          w="full"
                          position="absolute"
                          zIndex={1}
                          rounded="2xl"
                          bg="rgba(0, 0, 0, 0.3)"
                          backdropFilter="blur(2px)"
                        />
                        <TemplateEditorOverlay />
                      </>
                    )}
                    <CodeMirror
                      onChange={handleTemplateValueChange}
                      value={html}
                      theme={vscodeDark}
                      extensions={extensions}
                      editable={IsGrowthOrHigher}
                      style={{ height: isFullscreenEditor ? '87vh' : '320px' }}
                      className={css({
                        fontSize: 'sm',
                        resize: 'vertical',
                        overflow: 'auto',
                        rounded: '2xl',
                        outline: showHtmlError ? 'solid' : 'hidden',
                        outlineColor: 'negative.darker',
                        outlineWidth: 'thick',
                      })}
                    />
                    <Box position="absolute" right={4} top={4}>
                      <Button size="sm" variant="transparent" onPress={toggleFullscreenEditor}>
                        <Button.LeadingIcon>{isFullscreenEditor ? <IcoMinimize /> : <IcoExpand />}</Button.LeadingIcon>
                      </Button>
                    </Box>
                    {showHtmlError && (
                      <Box mt={2}>
                        <Text size="sm" variant="error">
                          {!html.trim()
                            ? 'Template cannot be empty'
                            : !templateVariablesAreValid()
                              ? invalidTemplateVariablesWarning
                              : null}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Flex>
              </Flex>
              {IsGrowthOrHigher && (
                <Flex flexDir="column" alignItems="flex-end" mt={9} smDown={{ alignItems: 'center', mt: 4 }}>
                  {!hasCustomSmtp && (
                    <Callout
                      label="To publish, enable a custom email provider"
                      variant="warning"
                      onPress={() => router.push(`/app/settings?cid=${magic_client_id}#custom-email-provider`)}
                    />
                  )}
                  <HStack mt={4} gap={4} smDown={{ flexDir: 'column' }}>
                    <Button
                      variant="tertiary"
                      label="Send Test"
                      size="md"
                      onPress={handleSendTest}
                      disabled={isSendingTestEmail}
                    />
                    <Button
                      disabled={!customSmtpInfo || !Object.keys(customSmtpInfo).length || isPublishing}
                      label="Save and Publish"
                      size="md"
                      onPress={() => {
                        if (isPublishable()) {
                          onClickPublish();
                        } else {
                          handlePublishErrors();
                        }
                      }}
                    />
                  </HStack>
                </Flex>
              )}
            </Flex>
            <Box
              w={isFullscreenEditor ? '0' : '1/2'}
              transition="width 0.3s"
              overflow="hidden"
              textWrap={isTogglingFullscreenEditor ? 'nowrap' : 'wrap'}
              borderLeftColor="neutral.tertiary"
              borderLeftWidth="thin"
              lgDown={{ display: 'none' }}
            >
              <TemplatePreview
                html={sanitizeAndConvertHtml(html, app_name)}
                subject={subject}
                senderEmail={customSmtpInfo?.senderEmail}
                senderName={customSmtpInfo?.senderName}
                bindingId={bindingId}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};

export const EmailTemplateView = ({ params }: { params: { id: string } }) => {
  const bindingId = decodeURIComponent(params.id);

  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} bindingId={bindingId} />;
};
