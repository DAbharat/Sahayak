export type EligibilityStatus = 'eligible' | 'need_info' | 'ineligible';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Scheme {
  id: string;
  scheme_id: number; // int64 matching Go backend SchemeID
  name: string;
  nameHi: string;
  ministry: string;
  ministryHi: string;
  category: 'livelihood' | 'agriculture' | 'healthcare' | 'housing' | 'women_child' | 'skill_artisan' | 'education' | 'social_security';
  categoryLabel: string;
  categoryLabelHi: string;
  status: EligibilityStatus;
  statusLabel: string;
  statusLabelHi: string;
  brief: string;
  briefHi: string;
  benefits: string;
  benefitsHi: string;
  qualifyReasons: string[];
  qualifyReasonsHi: string[];
  infoNeeded: string[];
  infoNeededHi: string[];
  ineligibleReasons?: string[];
  ineligibleReasonsHi?: string[];
  requiredDocuments: Array<{
    name: string;
    nameHi: string;
    isMandatory: boolean;
    formatNote?: string;
  }>;
  nextSteps: Array<{
    stepNumber: number;
    title: string;
    titleHi: string;
    description: string;
    descriptionHi: string;
  }>;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
  targetOccupations: string[];
  maxIncome?: number;
  featured?: boolean;
}

// Exact Profile DTO corresponding to the Go backend 'profiles' table and ProfileResponse
export interface UserProfile {
  id?: number;
  account_id?: number;
  state: string;
  district?: string;
  occupation: string;
  monthly_income?: number;
  age?: number;
  gender?: Gender;
  children_count?: number;
  created_at?: string;
  caste_category?: string;
  is_registered_worker?: boolean;
  has_bank_account?: boolean;
  
  // UI Display & Helper fields
  name?: string;
  stateHi?: string;
  occupationHi?: string;
  monthlyIncome?: number; // alias for monthly_income
  children?: number; // alias for children_count
  rawInput?: string;
  inputMode?: 'voice' | 'text';
}

// Go Backend Account Request & Response Types
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface CreateProfileRequest {
  state: string;
  occupation: string;
  monthly_income: number;
  age: number;
  gender: Gender;
  children_count: number;
}

export interface ProfileResponse {
  id: number;
  account_id: number;
  state: string;
  occupation: string;
  monthly_income: number;
  age: number;
  gender: Gender;
  children_count: number;
  created_at: string;
}

// Go Backend Grievance Request & Response Types
export interface GrievanceProfileContext {
  state: string;
  occupation: string;
  monthly_income: number;
  age: number;
  gender: Gender | string;
  children_count: number;
}

export interface GrievanceRequest {
  scheme_id: number; // int64
  user_text: string;
  draft_type?: string; // Go backend forces this to "grievance"
  language: 'hi' | 'en' | 'hinglish' | string;
  profile_context?: GrievanceProfileContext;
  scheme_name?: string;
}

export interface GenerateGrievanceResponse {
  user_text: string;
  draft_type: string;
  language: string;
  profile_context: GrievanceProfileContext;
  subject: string;
  body: string;
  placeholders: string[];
  disclaimer: string;
  correlation_id: string;
  scheme_name: string;
}

export interface GrievanceDraft {
  toAuthority?: string;
  subject: string;
  body: string;
  schemeId?: string;
  scheme_id?: number;
  schemeName?: string;
  dateGenerated: string;
  placeholders?: string[];
  disclaimer?: string;
  correlation_id?: string;
  language?: string;
  applicantDetails?: {
    name: string;
    state: string;
    phone?: string;
    email?: string;
  };
}

export interface UserAuth {
  isAuthenticated: boolean;
  id?: number;
  email?: string;
  name?: string;
  phone?: string;
  access_token?: string;
  refresh_token?: string;
  aadhaarLast4?: string;
  state?: string;
}
