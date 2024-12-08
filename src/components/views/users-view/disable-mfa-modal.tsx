import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDisableMfaMutation } from '@hooks/data/mfa';
import { Button, Checkbox, IconWarningShield, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack, Stack } from '@styled/jsx';
import { type QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { create } from 'zustand';

interface DisableMfaModalState {
  userId: string;
  authUserId: string;
  queryKey?: QueryKey;
  isOpened: boolean;
  setQueryKey: (queryKey: QueryKey) => void;
  open: (userId: string, authUserId: string) => void;
  close: () => void;
}

export const useDisableMfaModal = create<DisableMfaModalState>()((set) => ({
  userId: '',
  authUserId: '',
  isOpened: false,
  setQueryKey: (queryKey: QueryKey) => set({ queryKey }),
  open: (userId: string, authUserId: string) =>
    set({
      isOpened: true,
      userId,
      authUserId,
    }),
  close: () => set({ isOpened: false, userId: '', authUserId: '', queryKey: undefined }),
}));

const schema = z
  .object({
    checked: z.boolean().refine((v) => v),
    userLogin: z.string(),
    validUserLogin: z.string().min(1),
  })
  .refine(
    (data) => data.userLogin === data.validUserLogin,
    (data) => ({
      message: `Please enter the user’s exact identifier ${data.validUserLogin}`,
      path: ['userLogin'],
    }),
  );

type FormData = z.infer<typeof schema>;

type Props = {
  appId: string;
};

export const DisableMfaModal = ({ appId }: Props) => {
  const { createToast } = useToast();
  const { userId, authUserId, queryKey, isOpened, close } = useDisableMfaModal();

  const { mutateAsync: disableMfa } = useDisableMfaMutation({
    onSuccess: () => {
      createToast({
        message: 'MFA successfully disabled',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to disable MFA',
        variant: 'error',
      });
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      checked: false,
      userLogin: '',
    },
  });

  const handleCancel = useCallback(() => {
    close();
    reset();
  }, [close, reset]);

  const onSubmit = handleSubmit(async () => {
    if (queryKey) {
      await disableMfa({
        appId,
        authUserId,
        queryKey,
      });
    }

    handleCancel();
  });

  useEffect(() => {
    setValue('validUserLogin', userId);
  }, [setValue, userId]);

  return (
    <Modal in={isOpened}>
      <ModalCloseButton handleClose={handleCancel} />

      <form onSubmit={onSubmit}>
        <Stack gap={10}>
          <Stack gap={4}>
            <IconWarningShield width={48} height={48} />
            <Text.H3>Disable MFA for {userId}?</Text.H3>
            <Text>
              You’re responsible for verifying this user’s identifier and confirming their intent to disable
              multi-factor auth.
            </Text>
            <Text>To proceed, please enter the user’s identifier and agree to the acknowledgement below:</Text>
          </Stack>

          <Stack gap={8}>
            <Controller
              name="userLogin"
              control={control}
              render={({ field }) => (
                <TextInput
                  disabled={isSubmitting}
                  placeholder={userId}
                  label="User Identifier"
                  errorMessage={errors.userLogin?.message}
                  value={field.value}
                  className={css({ w: 'full' })}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              )}
            />

            <Controller
              name="checked"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="checked"
                  disabled={isSubmitting}
                  checked={field.value}
                  onChange={(e) => field.onChange(e)}
                  label="I have verified this user’s Identifier"
                />
              )}
            />
          </Stack>

          <HStack gap={4} justifyContent="flex-end">
            <Button variant="neutral" label="Cancel" onPress={handleCancel} disabled={isSubmitting} />
            <Button
              variant="negative"
              label="Disable MFA"
              type="submit"
              disabled={isSubmitting || !isValid}
              validating={isSubmitting}
            />
          </HStack>
        </Stack>
      </form>
    </Modal>
  );
};
