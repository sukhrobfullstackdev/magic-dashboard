import { AppType, PASSPORT_APP } from '@constants/appInfo';
import { Box, Center } from '@styled/jsx';

type AppImageProps = {
  appType: AppType;
};

const IMAGE_CONTENT: {
  [key: string]: {
    imgUrl: string;
    altText: string;
  };
} = {
  embedded: {
    imgUrl: '/images/embedded-wallet.png',
    altText: 'embedded-wallet-image',
  },
  passport: {
    imgUrl: '/images/passport.png',
    altText: 'passport-image',
  },
};

const AppImage = ({ appType }: AppImageProps) => {
  return (
    <Center mt={10} justifyContent="flex-start">
      <Box maxW={appType === PASSPORT_APP ? '600px' : '450px'}>
        <img src={IMAGE_CONTENT[appType].imgUrl} alt={IMAGE_CONTENT[appType].altText} />
      </Box>
    </Center>
  );
};

export default AppImage;
