import Image from 'next/image';

type Props = {
  provenance: string;
};

export const IconProvenance = ({ provenance }: Props) => {
  return (
    <Image src={`/images/login_type_logos/${provenance.toLowerCase()}.svg`} alt="SignInMethod" width={20} height={20} />
  );
};

IconProvenance.displayName = 'IconProvenance';
