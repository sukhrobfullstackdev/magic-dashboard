import { DedicatedTable } from '@components/views/users-view/dedicated-table';
import { PassportTable } from '@components/views/users-view/passport-table';
import { AppType, PASSPORT_APP } from '@constants/appInfo';
import { type SignupAppUser } from '@hooks/data/app-users/types';
import { type QueryKey } from '@tanstack/react-query';

type Props = {
  queryKey: QueryKey;
  data: SignupAppUser[];
  appType: AppType;
};

export const UserTable = ({ data, queryKey, appType }: Props) => {
  return appType === PASSPORT_APP ? <PassportTable data={data} /> : <DedicatedTable data={data} queryKey={queryKey} />;
};
