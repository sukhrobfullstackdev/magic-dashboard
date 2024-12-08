import { useAnalytics } from '@components/hooks/use-analytics';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { DD_MESSAGES } from '@constants/dd-messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import { useQuoteSuspenseQuery } from '@hooks/data/billing';
import { billingQueryKeys } from '@hooks/data/billing/keys';
import { useUpdateTeamPlanMutation } from '@hooks/data/teams';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { formatToDate } from '@libs/date';
import {
  Button,
  Checkbox,
  DropdownOption,
  DropdownSelector,
  IcoArrowRight,
  IcoWarningFill,
  Text,
  TextInput,
  useToast,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { create } from 'zustand';

interface DowngradePlanModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useDowngradeToFreeModal = create<DowngradePlanModalState>()((set) => ({
  isOpen: false,
  open: () =>
    set({
      isOpen: true,
    }),
  close: () => set({ isOpen: false }),
}));

const schema = z.object({
  isChecked: z.boolean().refine((val) => val === true, { message: 'Please confirm that you wish to downgrade' }),
  option: z.string().min(1),
  reason: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export const DowngradeToFreeModal = () => {
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();
  const router = useRouter();

  const { currentTeam } = useCurrentTeam();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { isOpen, close } = useDowngradeToFreeModal((state) => ({
    isOpen: state.isOpen,
    close: state.close,
  }));

  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  const { mutateAsync: updateTeamPlan } = useUpdateTeamPlanMutation({
    onMutate: () => {
      trackAction(ANALYTICS_ACTION_NAMES.CLICK_DOWNGRADE_TO_FREE);
    },
    onSuccess: async () => {
      trackAction(ANALYTICS_ACTION_NAMES.SUCCESSFUL_DOWNGRADE_TO_FREE);
      await router.push('/account/billing');
      createToast({
        message: 'Plan Downgraded',
        variant: 'neutral',
      });
    },
    onError: (error, params, context) => {
      logger.error(DD_MESSAGES.FAILED_TO_UPDATE_TEAM_PLAN, { params, context }, error);
      createToast({
        message: 'Error: try again or contact support',
        variant: 'error',
      });
    },
    onSettled: () => {
      close();
    },
  });

  const { data: quote } = useQuoteSuspenseQuery(
    billingQueryKeys.quote({
      teamId: userInfo.teamId,
      productPriceKey: 'free',
    }),
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      isChecked: false,
      option: '',
      reason: '',
    },
  });
  const option = watch('option');

  const onSubmit = handleSubmit(async (data) => {
    await updateTeamPlan({
      teamId: currentTeam.teamId,
      productPriceKey: 'free',
      quoteId: quote.quoteId,
      downgradeReason: data.reason,
    });
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    setValue('reason', option !== 'other-reason' ? option : '', { shouldValidate: true });
  }, [option, setValue]);

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={close} />
      <form onSubmit={onSubmit}>
        <Stack boxSizing="border-box">
          <Text.H3 styles={{ color: token('colors.negative.darker') }}>Downgrade to Developer</Text.H3>
          <Stack gap={4} my={7}>
            <Text>Before downgrading, please do the following:</Text>
            <Link href="/app/all_apps" shallow>
              <Button expand label="Disable MFA for all users across all apps" variant="neutral">
                <Button.TrailingIcon>
                  <IcoArrowRight />
                </Button.TrailingIcon>
              </Button>
            </Link>
            <Link href="/account/team" shallow>
              <Button expand label="Remove 3 team members" variant="neutral">
                <Button.TrailingIcon>
                  <IcoArrowRight />
                </Button.TrailingIcon>
              </Button>
            </Link>
          </Stack>
          <Stack gap={4}>
            <Text>
              By downgrading, the following changes will take effect{' '}
              {plan.endedAt && (
                <>
                  on <b>{formatToDate(plan.endedAt)}</b>:
                </>
              )}
            </Text>
            <HStack gap={3}>
              <IcoWarningFill color={token('colors.warning.base')} />
              <Text size="sm">Login Data Export disabled</Text>
            </HStack>
          </Stack>

          <Divider color="neutral.tertiary" my={10} />

          <Controller
            name="isChecked"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="checked"
                checked={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                label="I understand and wish to downgrade"
              />
            )}
          />
          <VStack gap={2} mt={7}>
            <Controller
              name="option"
              control={control}
              render={({ field }) => (
                <DropdownSelector
                  selectedValue={field.value}
                  disabled={isSubmitting}
                  onSelect={field.onChange}
                  label="Reason for downgrading"
                  placeholder="Select a reason"
                >
                  <DropdownOption value="no-need" label="I no longer need the additional features." />
                  <DropdownOption value="alternative" label="I found an alternative." />
                  <DropdownOption value="too-expensive" label="It's too expensive." />
                  <DropdownOption value="other-reason" label="Other reason, please specify" />
                </DropdownSelector>
              )}
            />
            {option === 'too-expensive' && (
              <Text>
                <a href="https://magic.link/contact" target="_blank" style={{ fontWeight: 600 }} rel="noreferrer">
                  Contact us
                </a>{' '}
                for custom pricing
              </Text>
            )}
            {option === 'other-reason' && (
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextInput
                    className={css({ w: 'full' })}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type the reason here..."
                    aria-label="specify reason"
                  />
                )}
              />
            )}
          </VStack>
          <HStack
            className={css({ '@media screen and (max-width: 768px)': { flexDirection: 'column-reverse' } })}
            justifyContent="flex-end"
            gap={4}
            mt={10}
          >
            <Button disabled={isSubmitting} expand label="Never mind" onPress={close} variant="neutral" />
            <Button
              disabled={!isValid || isSubmitting}
              expand
              label="Confirm Downgrade"
              type="submit"
              variant="negative"
              validating={isSubmitting}
            />
          </HStack>
        </Stack>
      </form>
    </Modal>
  );
};
