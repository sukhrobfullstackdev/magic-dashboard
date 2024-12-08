import { CustomSmtpInfoReadOnly } from '@components/partials/settings/custom-email-provider-card/custom-smtp-info-read-only';
import { appearFromBottom } from '@constants/animates';
import { PLAN_NAMES } from '@constants/pricing';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlan } from '@hooks/common/use-plan';
import { type AppInfo } from '@hooks/data/app/types';
import {
  useCustomSmtpInfoSuspenseQuery,
  useSaveCustomSmtpInfoMutation,
  useSendTestEmailMutation,
} from '@hooks/data/custom-smtp';
import { customSmtpQueryKeys } from '@hooks/data/custom-smtp/keys';
import { CustomSmtpInfo } from '@hooks/data/custom-smtp/types';
import { logger } from '@libs/datadog';
import { CustomError } from '@libs/error';
import { isEmpty } from '@libs/utils';
import {
  Button,
  Card,
  IcoEyeClosed,
  IcoEyeOpened,
  IcoLockLocked,
  LoadingSpinner,
  Switch,
  Text,
  TextInput,
  useToast,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, Grid, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  senderEmail: z.string(),
  senderName: z.string(),
  host: z.string(),
  port: z.string(),
  userName: z.string(),
  userPassword: z.string(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  appInfo: AppInfo;
};

const Resolved = ({ appInfo }: Props) => {
  const [isEditable, setIsEditable] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const { createToast } = useToast();

  const { data: customSmtpInfo } = useCustomSmtpInfoSuspenseQuery(
    customSmtpQueryKeys.info({
      appId: appInfo.appId,
    }),
  );

  const {
    plan: { planName },
  } = usePlan({
    teamId: appInfo.teamId,
  });

  const { mutateAsync: saveCustomSmtpInfo } = useSaveCustomSmtpInfoMutation({
    onSuccess: () => {
      createToast({
        message: 'Custom SMTP updated',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to update custom SMTP',
        variant: 'error',
      });
    },
  });

  const { mutateAsync: sendTestEmail, isPending } = useSendTestEmailMutation({
    onSuccess: () => {
      createToast({
        message: 'Test email sent',
        variant: 'success',
      });
    },
    onError: (error: CustomError) => {
      const message = error?.message || 'Failed to send test email';
      createToast({
        message,
        variant: 'error',
        lifespan: 5000,
      });
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderEmail: customSmtpInfo?.senderEmail,
      senderName: customSmtpInfo?.senderName,
      host: customSmtpInfo?.host,
      port: customSmtpInfo?.port,
      userName: customSmtpInfo?.userName,
      userPassword: customSmtpInfo?.userPassword,
    },
  });

  const isLocked = useMemo(() => {
    return planName !== PLAN_NAMES.GROWTH && planName !== PLAN_NAMES.LEGACY && planName !== PLAN_NAMES.ENTERPRISE;
  }, [planName]);

  const handleEdit = useCallback(() => {
    setIsEditable(true);

    if (customSmtpInfo) {
      setIsCustom(true);
      reset();
    } else {
      setIsCustom(false);
    }
  }, [customSmtpInfo, reset]);

  const handleSave = handleSubmit(async (data) => {
    try {
      await saveCustomSmtpInfo({
        appId: appInfo.appId,
        customSmtpInfo: isCustom ? data : ({} as CustomSmtpInfo),
      });

      setIsEditable(false);
    } catch (error) {
      logger.error('There was an issue saving the SMTP configuration.', {}, error as Error);
    }
  });

  const handleSendTest = async () => {
    await sendTestEmail({
      appId: appInfo.appId,
    });
  };

  return (
    <form onSubmit={handleSave}>
      <HStack justifyContent="space-between" h="2.375rem" mb={6}>
        <Text.H4 fontWeight="semibold">Custom Email Provider</Text.H4>
        <AnimatePresence mode="wait">
          {isLocked ? (
            <IcoLockLocked color={token('colors.text.tertiary')} />
          ) : isEditable ? (
            <motion.div key="editable" {...appearFromBottom} transition={{ duration: 0.1 }}>
              <HStack gap={6}>
                <Button variant="text" label="Cancel" onPress={() => setIsEditable(false)} disabled={isSubmitting} />
                <Button label="Save" type="submit" disabled={!isValid} validating={isSubmitting} />
              </HStack>
            </motion.div>
          ) : (
            <motion.div key="non-editable" {...appearFromBottom} transition={{ duration: 0.1 }}>
              <Button variant="text" label="Edit" onPress={handleEdit} />
            </motion.div>
          )}
        </AnimatePresence>
      </HStack>

      {isEditable && (
        <Stack gap={6}>
          <Text fontColor="text.tertiary">
            Connect an SMTP server to customize the sender name and email
            <br />
            address used for email login.
          </Text>

          <HStack justifyContent="space-between">
            <Stack gap={2}>
              <Text fontWeight="semibold">Use my own email provider</Text>
              <Text fontColor="text.tertiary">Visit Docs for step-by-step instructions</Text>
            </Stack>
            <Switch type="button" checked={isCustom} onPress={() => setIsCustom((prev) => !prev)} />
          </HStack>

          {isCustom && (
            <>
              <Grid gridTemplateColumns={'1fr 1fr'} gap={5}>
                <Controller
                  name="senderEmail"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      label="Sender email"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="example@your-domain.com"
                      errorMessage={errors.senderEmail?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="senderName"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      label="Sender name"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Your company name"
                      errorMessage={errors.senderName?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="host"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      label="Host"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="smtp.customsmtpapp.com"
                      errorMessage={errors.host?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="port"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      label="Port"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="8080"
                      errorMessage={errors.port?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="userName"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      label="Username"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Username"
                      errorMessage={errors.userName?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="userPassword"
                  control={control}
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <TextInput
                      type={passwordShown ? 'text' : 'password'}
                      label="Password"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="••••••••"
                      errorMessage={errors.userName?.message}
                      required
                    >
                      <TextInput.ActionIcon onClick={() => setPasswordShown((prev) => !prev)}>
                        {passwordShown ? <IcoEyeOpened /> : <IcoEyeClosed />}
                      </TextInput.ActionIcon>
                    </TextInput>
                  )}
                />
              </Grid>

              <Divider color="neutral.tertiary" my={2} />

              <HStack justifyContent="space-between" alignItems="end">
                <Stack gap={2}>
                  <Text.H4 fontWeight="semibold">Test SMTP server configuration</Text.H4>
                  <Text fontColor="text.tertiary">The settings need to be saved to send test email.</Text>
                </Stack>
                <Button
                  variant="tertiary"
                  label="Send test email"
                  onPress={handleSendTest}
                  disabled={isSubmitting || isPending}
                  validating={isPending}
                />
              </HStack>
            </>
          )}
        </Stack>
      )}

      {!isEditable && (
        <Box mt={6}>
          {!customSmtpInfo || isEmpty(customSmtpInfo) ? (
            <Text fontColor="text.tertiary">Login emails are being sent from Magic’s SMTP service.</Text>
          ) : (
            <CustomSmtpInfoReadOnly customSmtpInfo={customSmtpInfo} />
          )}
        </Box>
      )}
    </form>
  );
};

export const CustomEmailProviderCard = ({ appInfo }: Props) => {
  return (
    <Card className={css({ p: 8, maxW: '47.5rem' })} id="card-custom-email-provider">
      <Suspense
        fallback={
          <Stack gap={6}>
            <Text.H4 fontWeight="semibold">Custom Email Provider</Text.H4>
            <LoadingSpinner size={28} strokeWidth={3} />
          </Stack>
        }
      >
        <Resolved appInfo={appInfo} />
      </Suspense>
    </Card>
  );
};
