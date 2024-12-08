import { LogoImage } from '@components/views/customization-view/components/logo-image';
import { DEFAULT_APP_LOGO_SRC } from '@constants/appInfo';
import { useUploadPassportAppLogoMutation } from '@hooks/data/app';
import { LogoFile } from '@interfaces/client';
import { Button, Text } from '@magiclabs/ui-components';

import { Box, HStack, Stack } from '@styled/jsx';
import { ChangeEvent, DragEvent, useState } from 'react';

type UploadLogoProps = {
  appId: string;
  logoFile: LogoFile;
  setLogoFile: (file: LogoFile) => void;
  setIsDirty: (isDirty: boolean) => void;
};

export const UploadLogo = ({ appId, logoFile, setLogoFile, setIsDirty }: UploadLogoProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { mutateAsync: uploadPassportLogo } = useUploadPassportAppLogoMutation();

  const processFiles = async (files: FileList) => {
    const file = files[0];
    const formData = new FormData();

    if (!file) return;

    if (file.size > 512000) {
      setErrorMessage('Image file is too large. Maximum size is 512 KB.');
      return;
    }

    formData.set('logo', file);

    if (file) {
      setErrorMessage('');
    } else {
      setErrorMessage('Please upload a valid file.');
    }

    try {
      const response = await uploadPassportLogo({ appId, formData });
      setLogoFile({ asset_uri: response.logo_uri, is_default_asset: false });
      setIsDirty(true);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleUpload = () => {
    document.getElementById('file-picker')?.click();
  };

  return (
    <Stack w="fit-content">
      <HStack
        w="fit-content"
        borderColor={isDragging ? 'neutral.primary' : 'neutral.secondary'}
        borderWidth="thick"
        borderStyle="dashed"
        rounded="0.625rem"
        p={5}
        gap={3}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <LogoImage
          assetUri={logoFile.asset_uri || DEFAULT_APP_LOGO_SRC}
          isDefaultAsset={!!logoFile.is_default_asset}
          setLogoFile={setLogoFile}
          setIsDirty={setIsDirty}
        />
        <Stack gap={0}>
          <Box>
            <Button variant="text" size="sm" label="Upload Image" onPress={handleUpload} />
          </Box>
          <Text fontColor="text.tertiary">or drag & drop here</Text>
          <input type="file" id="file-picker" style={{ display: 'none' }} onChange={handleFileChange} />
        </Stack>
      </HStack>
      {errorMessage && (
        <Text variant="error" size="sm">
          {errorMessage}
        </Text>
      )}
    </Stack>
  );
};
