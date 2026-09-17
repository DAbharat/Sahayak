export type EligibilityStatus = 'MAY_QUALIFY' | 'MORE_INFO_NEEDED' | 'DOES_NOT_MATCH';

export interface UserProfile {
  rawInput: string;
  state: string;
  occupation: string;
  monthlyIncome: number | null;
  children: number | null;
  age?: number | null;
  gender?: string;
  category?: string; // General, OBC, SC, ST
  urbanRural?: 'Urban' | 'Rural' | 'Any';
}

export interface SchemeCriterion {
  label: string;
  matched: boolean;
  notes?: string;
}

export interface SchemeDocument {
  name: string;
  hindiName?: string;
  description: string;
  mandatory: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  hindiName: string;
  shortDescription: string;
  ministry: string;
  eligibilityStatus: EligibilityStatus;
  statusHeadline: string;
  matchedCriteria: string[];
  missingInfo: string[];
  disqualifyingReasons: string[];
  requiredDocuments: SchemeDocument[];
  nextSteps: string[];
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
  maxBenefit: string;
  categoryTag: string;
}

export interface GrievanceDraft {
  toAuthority: string;
  department: string;
  subject: string;
  body: string;
  applicantName: string;
  applicantDetails: string;
  date: string;
  schemeId: string;
  schemeName: string;
}

export type InputMode = 'voice' | 'text' | null;

export type AppRoute = 
  | '/'
  | '/onboarding'
  | '/profile'
  | '/schemes'
  | `/schemes/${string}`
  | '/grievance';
