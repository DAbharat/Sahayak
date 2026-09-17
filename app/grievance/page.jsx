import React, { useState, useEffect } from 'react';
import { GrievanceEditor } from '../../components/GrievanceEditor.jsx';
import { generateGrievanceDraft } from '../../src/services/aiService';

/**
 * Container Page: app/grievance/page.jsx
 * Handles API calls to generate the formal grievance draft,
 * managing the state and passing the data down to the dumb UI component GrievanceEditor.
 */
export const GrievancePage = ({
  selectedScheme,
  userProfile,
  onBack
}) => {
  const [userProblem, setUserProblem] = useState(
    'I applied for the scheme two months ago but haven\'t received any update.'
  );
  const [draft, setDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // When selectedScheme changes, clear the draft to prevent displaying mismatched scheme data
  useEffect(() => {
    setDraft(null);
  }, [selectedScheme?.id]);

  // Container handles the API/service call
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await Promise.resolve(
        generateGrievanceDraft(selectedScheme, userProblem, userProfile)
      );
      setDraft(generated);
    } catch (err) {
      console.error('Failed to generate grievance draft:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateDraftText = (updatedBody) => {
    if (draft) {
      setDraft({
        ...draft,
        body: updatedBody
      });
    }
  };

  return (
    <div id="grievance-route" className="w-full py-4 sm:py-8 px-4">
      <GrievanceEditor
        schemeName={selectedScheme ? selectedScheme.name : 'Government Scheme'}
        userProblem={userProblem}
        draft={draft}
        isGenerating={isGenerating}
        onProblemChange={setUserProblem}
        onGenerate={handleGenerate}
        onUpdateDraftText={handleUpdateDraftText}
        onBack={onBack}
      />
    </div>
  );
};

export default GrievancePage;
