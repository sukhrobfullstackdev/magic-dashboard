import { UserTable } from '@components/views/users-view/user-table';
import { appearFromBottom } from '@constants/animates';
import { AppType } from '@constants/appInfo';
import { useSearchAppUsersQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { LoadingSpinner, Text } from '@magiclabs/ui-components';
import { center, stack } from '@styled/patterns';
import { AnimatePresence, motion } from 'framer-motion';

type SearchUsersTableProps = {
  appId: string;
  appType: AppType;
  keyword: string;
};

export const SearchedUsersTable = ({ appId, appType, keyword }: SearchUsersTableProps) => {
  const querykey = appUsersQueryKey.search({ appId, keyword });
  const { data: appUsers, isLoading } = useSearchAppUsersQuery(querykey);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading && (
        <motion.div
          key={`searching-loading-${keyword}`}
          className={center({ pt: 6, px: 4, pb: 2 })}
          {...appearFromBottom}
        >
          <LoadingSpinner />
        </motion.div>
      )}
      {appUsers && (
        <motion.div key={`searched-users-with-${keyword}`} className={stack({ gap: 6, mt: 4 })} {...appearFromBottom}>
          <Text fontColor="text.tertiary">{appUsers.count} users total</Text>
          {appUsers.count > 0 && <UserTable data={appUsers.users} appType={appType} queryKey={querykey} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
