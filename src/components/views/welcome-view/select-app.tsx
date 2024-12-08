import { renderNewAppSelectCard } from '@components/partials/create-new-app-modal/app-card';
import { AppType, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { Stack } from '@styled/jsx';
import { UseFormSetValue } from 'react-hook-form';

type SelectAppProps = {
  selectedAppType: AppType;
  setValue: UseFormSetValue<{
    appType: typeof PASSPORT_APP | typeof EMBEDDED_APP;
  }>;
};

const SelectApp = ({ selectedAppType, setValue }: SelectAppProps) => {
  return (
    <Stack mt={1} mb={12} gap={5} maxW="28.25rem">
      {renderNewAppSelectCard(
        selectedAppType,
        EMBEDDED_APP,
        'Create your ideal wallet experience with full end‑to‑end customization',
        () => setValue('appType', EMBEDDED_APP),
        true,
      )}
      {renderNewAppSelectCard(
        selectedAppType,
        PASSPORT_APP,
        'Plug-and-play multi-chain smart wallet with global interoperability, live in minutes',
        () => setValue('appType', PASSPORT_APP),
        true,
      )}
    </Stack>
  );
};

export default SelectApp;
