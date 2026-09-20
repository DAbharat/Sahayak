import React from 'react';
import { GrievanceEditor } from '../../components/GrievanceEditor.tsx';
import { GenerateGrievanceResponse, GrievanceRequest, Scheme, UserProfile } from '../../types.ts';
import { generateGrievance } from '../../services/grievance.service.ts';

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
          return generateGrievance({
            scheme_id: request.scheme_id,
            user_text: request.user_text,
            draft_type: request.draft_type || 'grievance',
            language: request.language,
            scheme_name: request.scheme_name || '',
            profile_context: {
              state: request.profile_context?.state || '',
              occupation: request.profile_context?.occupation || '',
              monthly_income: request.profile_context?.monthly_income || 0,
              age: request.profile_context?.age || 0,
              gender: request.profile_context?.gender || 'MALE',
              children_count: request.profile_context?.children_count || 0
            }
          }) as unknown as GenerateGrievanceResponse;
        }}
      />
    </div>
  );
};

export default GrievancePage;
