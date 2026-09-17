import React from 'react';
import { SchemeDetails } from '../../../components/SchemeDetails.jsx';

/**
 * Container Page: app/schemes/[id]/page.jsx
 * Handles single scheme route, passing scheme data and action handlers
 * down to the dumb UI component SchemeDetails.
 */
export const SchemeDetailPage = ({
  scheme,
  onBack,
  onGenerateGrievance
}) => {
  return (
    <div id="scheme-detail-route" className="w-full py-4 sm:py-8 px-4">
      <SchemeDetails
        scheme={scheme}
        onBack={onBack}
        onGenerateGrievance={onGenerateGrievance}
      />
    </div>
  );
};

export default SchemeDetailPage;
