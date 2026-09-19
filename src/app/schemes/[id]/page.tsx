import React from 'react';
import { POPULAR_SCHEMES } from '../../../data/schemes.ts';
import { SchemeDetails } from '../../../components/SchemeDetails.tsx';
import { Scheme } from '../../../types.ts';

interface SchemeDetailPageProps {
  schemeId: string;
  onBack: () => void;
  onGenerateGrievance: (scheme: Scheme) => void;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  schemeId,
  onBack,
  onGenerateGrievance
}) => {
  const scheme = POPULAR_SCHEMES.find((s) => s.id === schemeId) || POPULAR_SCHEMES[0];

  return (
    <SchemeDetails
      scheme={scheme}
      onBack={onBack}
      onGenerateGrievance={onGenerateGrievance}
    />
  );
};

export default SchemeDetailPage;
