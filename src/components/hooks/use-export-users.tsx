import { useToast } from '@magiclabs/ui-components';
import { exportUsers } from '@services/user-export';
import { useMutation } from '@tanstack/react-query';

type Params = {
  appId: string;
  teamId: string;
};

export const useExportUsers = () => {
  const { createToast } = useToast();

  const { mutateAsync } = useMutation({
    mutationFn: async ({ appId, teamId }: Params) => {
      const response = await exportUsers(appId, teamId);
      if (!response.data) {
        throw new Error('Error exporting users');
      }

      const url = window.URL.createObjectURL(response.data);
      const aTag = document.createElement('a');
      aTag.href = url;
      aTag.download = `${new Date().toISOString()}.csv`;
      aTag.click();

      return url;
    },
    onSuccess: () => {
      createToast({
        message: 'Users exported successfully!',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Error exporting users',
        variant: 'success',
      });
    },
    onSettled: (data) => {
      if (data) {
        window.URL.revokeObjectURL(data);
      }
    },
  });

  return { exportUsers: mutateAsync };
};
