import { appearFromBottom } from '@constants/animates';
import { DD_MESSAGES } from '@constants/dd-messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEditTeamNameMutation, useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { Button, Card, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import Skeleton from 'react-loading-skeleton';
import { z } from 'zod';

const schema = z.object({
  teamId: z.string().min(1),
  teamName: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const Fallback = () => {
  return (
    <Card>
      <Box mb={6}>
        <Text.H4 fontWeight="semibold">Team Name</Text.H4>
      </Box>
      <Skeleton height={24} width={280} />
    </Card>
  );
};

const Resolved = () => {
  const { createToast } = useToast();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: userInfo.teamId }));

  const [isEdit, setIsEdit] = useState(false);

  const { mutateAsync: editTeamName } = useEditTeamNameMutation({
    onSuccess: () => {
      createToast({
        message: 'Team name updated',
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      logger.error(DD_MESSAGES.FAILED_TO_UPDATE_TEAM_NAME, { params, context }, error);
      createToast({
        message: 'Failed to update Team name',
        variant: 'error',
      });
    },
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      teamId: teamInfo.teamId,
      teamName: teamInfo.teamName,
    },
  });

  const onSubmit = handleSubmit(async ({ teamId, teamName }: FormData) => {
    if (teamName !== teamInfo.teamName) {
      await editTeamName({ teamId, name: teamName });
    }
    setIsEdit(false);
  });

  const handleCancel = () => {
    setIsEdit(false);
    reset();
  };

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <HStack h="38px" mb={6} justifyContent="space-between">
          <Text.H4 fontWeight="semibold">Team Name</Text.H4>
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div
                key="is-editing"
                {...appearFromBottom}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}
              >
                <Button variant="text" size="sm" onPress={handleCancel} disabled={isSubmitting} label="Cancel" />
                <Button type="submit" size="sm" validating={isSubmitting} label="Save" />
              </motion.div>
            ) : (
              <motion.div key="is-not-editing" {...appearFromBottom}>
                <Button variant="text" onPress={() => setIsEdit(true)} label="Edit" />
              </motion.div>
            )}
          </AnimatePresence>
        </HStack>
        <AnimatePresence>
          {isEdit ? (
            <Box maxW="250px">
              <TextInput
                aria-label="team name"
                disabled={isSubmitting}
                placeholder={teamInfo.teamName}
                {...register('teamName')}
                onChange={(value) => register('teamName').onChange({ target: { name: 'teamName', value } })}
              />
            </Box>
          ) : (
            <Box>
              <Text>{teamInfo.teamName}</Text>
            </Box>
          )}
        </AnimatePresence>
      </form>
    </Card>
  );
};

export const EditTeamNameCard = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved />
    </Suspense>
  );
};
