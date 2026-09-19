import React from 'react';
import { GrievanceEditor } from '../../components/GrievanceEditor.tsx';
import { GenerateGrievanceResponse, GrievanceRequest, Scheme, UserProfile } from '../../types.ts';
import { localApi } from '../../services/localData.ts';

interface GrievancePageProps {
  scheme?: Scheme | null;
  userProfile?: UserProfile | null;
  onNavigate: (route: string) => void;
}

export const GrievancePage: React.FC<GrievancePageProps> = ({
  scheme,
  userProfile,
  onNavigate
}) => {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <GrievanceEditor
        scheme={scheme}
        userProfile={userProfile}
        onNavigateHome={() => onNavigate('/')}
        onGenerate={async (request: GrievanceRequest): Promise<GenerateGrievanceResponse> => {
          return localApi.generateGrievance(request);
        }}
      />
    </div>
  );
};

export default GrievancePage;
