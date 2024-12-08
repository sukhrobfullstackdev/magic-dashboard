import { IcoMagic } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';

export const MagicLogoButton = () => {
  const router = useRouter();

  const handleClickMagic = () => {
    router.push('/app/all_apps');
  };

  return (
    <button aria-label="all-apps-link" className={css({ cursor: 'pointer' })} onClick={handleClickMagic}>
      <IcoMagic width={24} height={24} color={token('colors.brand.base')} />
    </button>
  );
};
