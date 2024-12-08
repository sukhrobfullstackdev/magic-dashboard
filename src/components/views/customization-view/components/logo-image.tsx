import { DEFAULT_APP_LOGO_SRC } from '@constants/appInfo';
import { LogoFile } from '@interfaces/client';
import { ButtonContainer, IcoDismiss } from '@magiclabs/ui-components';
import { Box, Circle } from '@styled/jsx';
import { center } from '@styled/patterns';

type LogoImageProps = {
  assetUri: string;
  isDefaultAsset: boolean;
  setLogoFile: (file: LogoFile) => void;
  setIsDirty: (isDirty: boolean) => void;
};

export const LogoImage = ({ assetUri, isDefaultAsset, setLogoFile, setIsDirty }: LogoImageProps) => {
  const handleRemoveLogo = () => {
    setLogoFile({ asset_uri: DEFAULT_APP_LOGO_SRC, is_default_asset: true });
    setIsDirty(true);
  };

  return (
    <Box position="relative">
      {!isDefaultAsset && (
        <Box position="absolute" right="-12px" top="-12px">
          <ButtonContainer onPress={handleRemoveLogo}>
            <Circle size={6} bg="neutral.quaternary" borderWidth="thick" borderColor="paper" boxSizing="content-box">
              <IcoDismiss width={12} height={12} />
            </Circle>
          </ButtonContainer>
        </Box>
      )}
      <img
        src={assetUri}
        alt="App logo"
        className={center({ w: '3.5rem', h: '3.5rem', rounded: 'lg', objectFit: 'contain' })}
      />
    </Box>
  );
};
