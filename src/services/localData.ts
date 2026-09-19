import {
  GenerateGrievanceResponse,
  GrievanceRequest,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RegisterRequest,
  RegisterResponse
} from '../types.ts';

const ACCOUNTS_KEY = 'sahayak_local_accounts';
const PROFILE_KEY = 'sahayak_local_profiles';

type LocalAccount = LoginResponse & { password: string };

const demoAccounts: LocalAccount[] = [
  {
    id: 1,
    email: 'farmer@sahayak.gov.in',
    password: 'password123',
    access_token: 'local-demo-token-farmer',
    refresh_token: 'local-demo-refresh-farmer'
  },
  {
    id: 2,
    email: 'vendor@sahayak.gov.in',
    password: 'password123',
    access_token: 'local-demo-token-vendor',
    refresh_token: 'local-demo-refresh-vendor'
  },
  {
    id: 3,
    email: 'artisan@sahayak.gov.in',
    password: 'password123',
    access_token: 'local-demo-token-artisan',
    refresh_token: 'local-demo-refresh-artisan'
  }
];

const demoProfiles: Record<number, ProfileResponse> = {
  1: {
    id: 1,
    account_id: 1,
    state: 'Maharashtra',
    occupation: 'Farmer',
    monthly_income: 15000,
    age: 45,
    gender: 'MALE',
    children_count: 2,
    created_at: new Date().toISOString()
  },
  2: {
    id: 2,
    account_id: 2,
    state: 'Haryana',
    occupation: 'Street Vendor',
    monthly_income: 12000,
    age: 38,
    gender: 'MALE',
    children_count: 2,
    created_at: new Date().toISOString()
  },
  3: {
    id: 3,
    account_id: 3,
    state: 'Rajasthan',
    occupation: 'Traditional Artisan',
    monthly_income: 14000,
    age: 32,
    gender: 'FEMALE',
    children_count: 1,
    created_at: new Date().toISOString()
  }
};

function readAccounts(): LocalAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : demoAccounts;
  } catch {
    return demoAccounts;
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readProfiles(): Record<number, ProfileResponse> {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : demoProfiles;
  } catch {
    return demoProfiles;
  }
}

function writeProfiles(profiles: Record<number, ProfileResponse>) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

function createToken(prefix: string, accountId: number) {
  return `local-${prefix}-${accountId}-${Date.now()}`;
}

async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const email = data.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some(account => account.email === email)) {
    throw new Error('An account with this email already exists');
  }

  const id = accounts.reduce((highest, account) => Math.max(highest, account.id), 0) + 1;
  accounts.push({
    id,
    email,
    password: data.password,
    access_token: createToken('token', id),
    refresh_token: createToken('refresh', id)
  });
  writeAccounts(accounts);
  return { id, email };
}

async function login(data: LoginRequest): Promise<LoginResponse> {
  const email = data.email.trim().toLowerCase();
  const account = readAccounts().find(
    candidate => candidate.email === email && candidate.password === data.password
  );
  if (!account) {
    throw new Error('Invalid email or password');
  }

  const response: LoginResponse = {
    id: account.id,
    email: account.email,
    access_token: createToken('token', account.id),
    refresh_token: createToken('refresh', account.id)
  };
  return response;
}

async function getProfile(accountId: number): Promise<ProfileResponse | null> {
  return readProfiles()[accountId] || null;
}

function buildGrievance(data: GrievanceRequest): GenerateGrievanceResponse {
  const schemeName = data.scheme_name || (data.scheme_id === 1 ? 'PM SVANidhi' : 'PM-Kisan');
  const language = data.language || 'en';
  const state = data.profile_context?.state || 'Maharashtra';
  const occupation = data.profile_context?.occupation || 'Farmer';
  const subject = language === 'hi'
    ? `${schemeName} के अंतर्गत आवेदन एवं वित्तीय सहायता में विलंब हेतु औपचारिक शिकायत`
    : `Regarding grievance concerning application under ${schemeName} - Immediate Resolution Request`;
  const body = language === 'hi'
    ? `सेवा में,\nलोक शिकायत निवारण अधिकारी,\n${schemeName} कार्यान्वयन विभाग\n\nमहोदय/महोदया,\n\nमैं ${state} का निवासी और ${occupation} हूँ। मैंने ${schemeName} के अंतर्गत आवेदन प्रस्तुत किया था।\n\nशिकायत का विवरण:\n"${data.user_text}"\n\nकृपया मेरे आवेदन [Application ID] की स्थिति की समीक्षा कर सहायता राशि शीघ्र जारी करने का निर्देश दें।\n\nसधन्यवाद,\nप्रार्थी\nराज्य: ${state}\nदिनांक: [Date]`
    : `To,\nThe Public Grievance Officer,\n${schemeName} Nodal Authority\n\nRespected Sir/Madam,\n\nI am a resident of ${state} and work as a ${occupation}. I submitted an application under ${schemeName}.\n\nGrievance Details:\n"${data.user_text}"\n\nPlease review application [Application ID], expedite verification, and provide a status update.\n\nYours sincerely,\nCitizen Applicant\nState: ${state}\nDate: [Date]`;

  return {
    user_text: data.user_text,
    draft_type: 'grievance',
    language,
    profile_context: {
      state,
      occupation,
      monthly_income: data.profile_context?.monthly_income ?? 15000,
      age: data.profile_context?.age ?? 45,
      gender: data.profile_context?.gender || 'MALE',
      children_count: data.profile_context?.children_count ?? 2
    },
    subject,
    body,
    placeholders: ['[Date]', '[Application ID]', '[Bank Branch Name]', '[Bank Account Number]'],
    disclaimer: 'This is a locally generated demo draft. Verify details before submission.',
    correlation_id: `local-${Date.now()}`,
    scheme_name: schemeName
  };
}

export const localApi = {
  register,
  login,
  getProfile,
  generateGrievance: async (data: GrievanceRequest) => buildGrievance(data),
  saveProfile: (profile: ProfileResponse) => {
    const profiles = readProfiles();
    profiles[profile.account_id] = profile;
    writeProfiles(profiles);
  }
};
