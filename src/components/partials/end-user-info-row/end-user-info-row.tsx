import { type UserInfo } from '@interfaces/user';
import { Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import Image from 'next/image';

type EndUser = Pick<UserInfo, 'id' | 'provenance'>;

type Props = {
  user: EndUser;
  isFullLength?: boolean;
};

const provenanceDisplayStringMap = {
  google: 'Google',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  apple: 'Apple',
  bitbucket: 'Bitbucket',
  gitlab: 'GitLab',
  twitter: 'Twitter',
  webauthn: 'WebAuthn',
} as const;

function getDisplayUserTypeLogoPath(user: EndUser) {
  let defaultType = 'link';
  if (user) {
    defaultType = user.provenance.toLowerCase();
  }
  return `/images/login_type_logos/${defaultType}.svg`;
}

export function getDisplayUserId(user: EndUser, isFullLength: boolean) {
  if (!user) return null;

  if (user.id) {
    // handle wallet address used as identifier
    if (user.id.length > 30 && !user.id.includes('@') && !isFullLength) {
      return `${user.id.substr(0, 6)}...${user.id.substr(-6, 6)}`;
    }
    return user.id;
  }

  const provenance = user.provenance.toLowerCase() as keyof typeof provenanceDisplayStringMap;
  if (provenanceDisplayStringMap[provenance]) return `${provenanceDisplayStringMap[provenance]} User`;
  return `${provenance[0]}${provenance.substr(1)} User`;
}

export const EndUserInfoRow = ({ user, isFullLength = false }: Props) => {
  return (
    <HStack gap={2.5} smDown={{ w: '50%' }} overflow="hidden">
      <Image src={getDisplayUserTypeLogoPath(user)} alt="SignInMethod" width={20} height={20} />
      <Text size="sm" truncate>
        {getDisplayUserId(user, isFullLength)}
      </Text>
    </HStack>
  );
};
