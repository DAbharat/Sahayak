import { Scheme, UserProfile } from '../types';

export const BASE_SCHEMES: Omit<Scheme, 'eligibilityStatus' | 'statusHeadline' | 'matchedCriteria' | 'missingInfo' | 'disqualifyingReasons'>[] = [
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi',
    hindiName: 'पीएम स्वनिधि योजना',
    shortDescription: 'Affordable working capital collateral-free micro-credit loans up to ₹50,000 with 7% interest subsidy for street vendors.',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    sourceName: 'Official PM SVANidhi Portal (MoHUA)',
    sourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    lastVerified: '12/03/2025',
    maxBenefit: '₹10,000 to ₹50,000 working loan with 7% cashback subsidy',
    categoryTag: 'Livelihood & Credit',
    requiredDocuments: [
      {
        name: 'Aadhaar Card',
        hindiName: 'आधार कार्ड',
        description: 'Linked to active mobile number for e-KYC verification',
        mandatory: true
      },
      {
        name: 'Certificate of Vending / Vending ID',
        hindiName: 'वेंडिंग प्रमाण पत्र / पहचान पत्र',
        description: 'Issued by Urban Local Body (ULB) / Town Vending Committee (TVC), or Letter of Recommendation (LoR)',
        mandatory: true
      },
      {
        name: 'Bank Account Passbook',
        hindiName: 'बैंक खाता पासबुक',
        description: 'Single or joint savings bank account for direct disbursement',
        mandatory: true
      }
    ],
    nextSteps: [
      'Get your Vending Certificate or Letter of Recommendation (LoR) from your local municipality or Nagar Nigam office.',
      'Visit the PM SVANidhi online portal (pmsvanidhi.mohua.gov.in) or nearest Common Service Centre (CSC).',
      'Submit your mobile-linked Aadhaar and bank account details for instant paperless sanction.',
      'Receive initial ₹10,000 tranche into your bank account; on timely repayment, unlock ₹20,000 and ₹50,000 limits.'
    ]
  },
  {
    id: 'mmpsy-haryana',
    name: 'Mukhya Mantri Parivar Samriddhi Yojana (MMPSY)',
    hindiName: 'मुख्यमंत्री परिवार समृद्धि योजना (हरियाणा)',
    shortDescription: 'State social security and financial protection providing up to ₹6,000 per year for families earning up to ₹1.80 lakh annually.',
    ministry: 'Department of Social Justice, Empowerment, Welfare of SCs & BCs, Government of Haryana',
    sourceName: 'Haryana Parivar Pehchan Patra (PPP) Portal',
    sourceUrl: 'https://meraparivar.haryana.gov.in',
    lastVerified: '08/02/2025',
    maxBenefit: '₹6,000 annual cash support and full insurance premium coverage',
    categoryTag: 'State Welfare (Haryana)',
    requiredDocuments: [
      {
        name: 'Parivar Pehchan Patra (Family ID)',
        hindiName: 'परिवार पहचान पत्र (PPP)',
        description: 'Haryana Family ID with verified annual income details',
        mandatory: true
      },
      {
        name: 'Haryana Resident Proof / Domicile',
        hindiName: 'हरियाणा निवास प्रमाण पत्र',
        description: 'Proof that the applicant has permanent domicile in Haryana',
        mandatory: true
      },
      {
        name: 'Bank Account linked with Family ID',
        hindiName: 'बैंक खाता विवरण',
        description: 'Aadhaar-seeded bank account for DBT payment transfers',
        mandatory: true
      }
    ],
    nextSteps: [
      'Check that your Haryana Parivar Pehchan Patra (Family ID) is verified with your current income under ₹1.80 lakh.',
      'Visit your nearest Antyodaya Saral Kendra, Atal Seva Kendra, or online via Saral Haryana portal.',
      'Authenticate with Family ID and opt in for direct DBT financial security disbursements.'
    ]
  },
  {
    id: 'eshram-card',
    name: 'e-Shram Social Security Card',
    hindiName: 'ई-श्रम कार्ड एवं सामाजिक सुरक्षा',
    shortDescription: 'National database and welfare coverage for unorganized workers, offering ₹2,00,000 accidental death/disability cover.',
    ministry: 'Ministry of Labour & Employment',
    sourceName: 'National Database of Unorganized Workers (NDUW)',
    sourceUrl: 'https://eshram.gov.in',
    lastVerified: '20/01/2025',
    maxBenefit: '₹2 Lakh accidental insurance + priority access to social schemes',
    categoryTag: 'Social Protection',
    requiredDocuments: [
      {
        name: 'Aadhaar Card',
        hindiName: 'आधार कार्ड',
        description: 'Aadhaar number with mobile OTP authentication',
        mandatory: true
      },
      {
        name: 'Active Bank Passbook',
        hindiName: 'बैंक पासबुक',
        description: 'Active bank account number and IFSC code for benefits',
        mandatory: true
      }
    ],
    nextSteps: [
      'Self-register on eshram.gov.in or visit any CSC Kendra with your mobile-linked Aadhaar.',
      'Enter your primary trade/occupation (Street vendor / Rehri-Patri / Informal worker).',
      'Download your 12-digit Universal Account Number (UAN) e-Shram card instantly.'
    ]
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    shortDescription: 'Cashless secondary and tertiary healthcare cover up to ₹5 Lakh per family per year at empaneled public and private hospitals.',
    ministry: 'National Health Authority (NHA), MoHFW',
    sourceName: 'Ayushman Bharat PM-JAY Official Portal',
    sourceUrl: 'https://beneficiary.nha.gov.in',
    lastVerified: '15/02/2025',
    maxBenefit: '₹5,00,000 cashless hospital treatment per family per year',
    categoryTag: 'Health & Medical',
    requiredDocuments: [
      {
        name: 'Aadhaar Card',
        hindiName: 'आधार कार्ड',
        description: 'Individual biometric or OTP verification',
        mandatory: true
      },
      {
        name: 'Ration Card / Family ID',
        hindiName: 'राशन कार्ड या परिवार पहचान पत्र',
        description: 'BPL / Antyodaya / State verified low-income family card',
        mandatory: true
      }
    ],
    nextSteps: [
      'Verify if your family is listed in SECC or state database via beneficiary.nha.gov.in.',
      'Visit any government hospital or registered CSC to complete your e-KYC.',
      'Receive your Ayushman Golden Card for cashless admission in over 27,000 hospitals.'
    ]
  },
  {
    id: 'pm-matru-vandana',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    hindiName: 'प्रधानमंत्री मातृ वंदना योजना',
    shortDescription: 'Direct maternity benefit cash incentive of ₹5,000 for first child and ₹6,000 for second girl child to wage-earning women.',
    ministry: 'Ministry of Women and Child Development',
    sourceName: 'PMMVY Official Web Portal',
    sourceUrl: 'https://pmmvy.wcd.gov.in',
    lastVerified: '10/01/2025',
    maxBenefit: 'Up to ₹6,000 direct cash assistance in bank account',
    categoryTag: 'Women & Child Welfare',
    requiredDocuments: [
      {
        name: 'Mother and Father Aadhaar Card',
        hindiName: 'माता-पिता का आधार कार्ड',
        description: 'Identity and residence verification',
        mandatory: true
      },
      {
        name: 'Mother-Child Protection (MCP) Card',
        hindiName: 'एमसीपी कार्ड (ममता कार्ड)',
        description: 'Issued by Anganwadi / Health Centre registering the pregnancy',
        mandatory: true
      },
      {
        name: 'Child Birth Registration Certificate',
        hindiName: 'बच्चे का जन्म प्रमाण पत्र',
        description: 'Required for installment validation',
        mandatory: true
      }
    ],
    nextSteps: [
      'Submit registration details at your local Anganwadi Centre or Asha worker.',
      'Verify LMP (Last Menstrual Period) date and institutional check-ups on the MCP card.',
      'Amount is transferred directly via DBT in staggered milestones.'
    ]
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    shortDescription: 'Direct income support of ₹6,000 per year in three 4-monthly installments to small and marginal landholding farmer families.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    sourceName: 'PM-Kisan Samman Nidhi Portal',
    sourceUrl: 'https://pmkisan.gov.in',
    lastVerified: '25/02/2025',
    maxBenefit: '₹6,000 per year (3 installments of ₹2,000 each)',
    categoryTag: 'Agriculture',
    requiredDocuments: [
      {
        name: 'Agricultural Landholding Record (Fard / Khasra-Khatauni)',
        hindiName: 'जमीन की फर्द / जमाबंदी',
        description: 'Land record in the name of the applicant farmer',
        mandatory: true
      },
      {
        name: 'Aadhaar Card with e-KYC',
        hindiName: 'आधार कार्ड',
        description: 'Biometric or facial e-KYC linked to PM-KISAN database',
        mandatory: true
      }
    ],
    nextSteps: [
      'Check your land mutation records with the local revenue officer (Patwari / Tehsildar).',
      'Register on pmkisan.gov.in with your Khatoni number.',
      'Complete biometric e-KYC at the nearest CSC.'
    ]
  }
];

export function evaluateSchemes(profile: UserProfile): Scheme[] {
  const occLower = (profile.occupation || '').toLowerCase();
  const stateLower = (profile.state || '').toLowerCase();
  const income = profile.monthlyIncome ?? 0;
  const isStreetVendor = occLower.includes('vendor') || occLower.includes('street') || occLower.includes('वेंडर') || occLower.includes('फेरी') || occLower.includes('दुकान') || occLower.includes('ठेला') || occLower.includes('rehri') || occLower.includes('patrivalla');
  const isFarmer = occLower.includes('kisan') || occLower.includes('farm') || occLower.includes('किसान') || occLower.includes('खेती');
  const isHaryana = stateLower.includes('haryana') || stateLower.includes('हरियाणा');

  return BASE_SCHEMES.map(base => {
    let eligibilityStatus: Scheme['eligibilityStatus'] = 'MAY_QUALIFY';
    let statusHeadline = 'You may qualify';
    const matchedCriteria: string[] = [];
    const missingInfo: string[] = [];
    const disqualifyingReasons: string[] = [];

    if (base.id === 'pm-svanidhi') {
      if (isStreetVendor) {
        matchedCriteria.push('Street vendor occupation ✓');
      } else if (!profile.occupation) {
        missingInfo.push('Occupation details not specified');
      } else {
        disqualifyingReasons.push('Exclusively intended for urban/peri-urban street vendors and mobile stall operators');
      }

      if (income > 0 && income <= 30000) {
        matchedCriteria.push('Income requirement matches micro-credit criteria ✓');
      } else if (income > 30000) {
        missingInfo.push('Income exceeds standard priority threshold; proof of vending hardship required');
      }

      if (stateLower) {
        matchedCriteria.push(`Operational in ${profile.state} municipalities ✓`);
      }

      if (disqualifyingReasons.length > 0) {
        eligibilityStatus = 'DOES_NOT_MATCH';
        statusHeadline = 'You may not qualify';
      } else if (missingInfo.length > 0) {
        eligibilityStatus = 'MORE_INFO_NEEDED';
        statusHeadline = 'More information needed';
      } else {
        eligibilityStatus = 'MAY_QUALIFY';
        statusHeadline = 'You may qualify';
      }
    } else if (base.id === 'mmpsy-haryana') {
      if (isHaryana) {
        matchedCriteria.push('Resident of Haryana ✓');
      } else if (!profile.state) {
        missingInfo.push('State residency details required');
      } else {
        disqualifyingReasons.push(`State-specific scheme for Haryana residents only (Current location: ${profile.state})`);
      }

      if (income > 0 && income <= 15000) {
        matchedCriteria.push('Monthly income ₹15,000 or below (under ₹1.80 Lakh/year ceiling) ✓');
      } else if (income > 15000) {
        disqualifyingReasons.push('Annual household income must be equal to or below ₹1.80 Lakh (₹15,000/month)');
      } else {
        missingInfo.push('Income verification through Family ID required');
      }

      if (profile.children !== null && profile.children > 0) {
        matchedCriteria.push(`Covers family with ${profile.children} child${profile.children > 1 ? 'ren' : ''} ✓`);
      }

      if (disqualifyingReasons.length > 0) {
        eligibilityStatus = 'DOES_NOT_MATCH';
        statusHeadline = 'Doesn\'t match the published criteria';
      } else if (missingInfo.length > 0) {
        eligibilityStatus = 'MORE_INFO_NEEDED';
        statusHeadline = 'More information needed';
      } else {
        eligibilityStatus = 'MAY_QUALIFY';
        statusHeadline = 'You may qualify';
      }
    } else if (base.id === 'eshram-card') {
      if (isStreetVendor || occLower.includes('informal') || occLower.includes('worker') || occLower.includes('driver') || occLower.includes('tailor') || occLower.includes('domestic')) {
        matchedCriteria.push('Unorganized informal sector occupation ✓');
      } else if (!profile.occupation) {
        missingInfo.push('Employment sector information needed');
      } else {
        matchedCriteria.push('Informal worker categorization reviewable ✓');
      }

      if (income > 0 && income <= 25000) {
        matchedCriteria.push('Income within unorganized worker bracket ✓');
      }

      if (profile.age) {
        if (profile.age >= 16 && profile.age <= 59) {
          matchedCriteria.push(`Age ${profile.age} years within 16-59 eligible bracket ✓`);
        } else {
          disqualifyingReasons.push('Age must be between 16 and 59 years');
        }
      } else {
        missingInfo.push('Age verification needed (must be 16–59 years)');
      }

      if (disqualifyingReasons.length > 0) {
        eligibilityStatus = 'DOES_NOT_MATCH';
        statusHeadline = 'Doesn\'t match the published criteria';
      } else if (missingInfo.length > 0) {
        eligibilityStatus = 'MORE_INFO_NEEDED';
        statusHeadline = 'More information needed';
      } else {
        eligibilityStatus = 'MAY_QUALIFY';
        statusHeadline = 'You may qualify';
      }
    } else if (base.id === 'ayushman-bharat') {
      if (income > 0 && income <= 20000) {
        matchedCriteria.push('Income qualifies under economic vulnerability threshold ✓');
      } else if (income > 20000) {
        missingInfo.push('SECC database or State BPL/NFSA inclusion needs checking');
      } else {
        missingInfo.push('Household income documentation needed');
      }

      if (profile.children !== null) {
        matchedCriteria.push('Covers all dependent family members without size cap ✓');
      }

      missingInfo.push('Ration card / BPL / SECC 2011 category validation needed');

      eligibilityStatus = 'MORE_INFO_NEEDED';
      statusHeadline = 'More information needed';
    } else if (base.id === 'pm-matru-vandana') {
      if (profile.children !== null && profile.children >= 1 && profile.children <= 2) {
        matchedCriteria.push(`Has ${profile.children} child${profile.children > 1 ? 'ren' : ''} (eligible for 1st/2nd child grant) ✓`);
      } else if (profile.children !== null && profile.children > 2) {
        disqualifyingReasons.push('Limited to the 1st live birth or 2nd child if female');
      }

      missingInfo.push('Pregnancy or lactation status of mother needed');
      missingInfo.push('Mother-Child Protection (MCP) card registration status required');

      if (disqualifyingReasons.length > 0) {
        eligibilityStatus = 'DOES_NOT_MATCH';
        statusHeadline = 'Doesn\'t match the published criteria';
      } else {
        eligibilityStatus = 'MORE_INFO_NEEDED';
        statusHeadline = 'More information needed';
      }
    } else if (base.id === 'pm-kisan') {
      if (isFarmer) {
        matchedCriteria.push('Farmer / Agriculture occupation ✓');
        missingInfo.push('Cultivable land record verification required');
        eligibilityStatus = 'MORE_INFO_NEEDED';
        statusHeadline = 'More information needed';
      } else {
        disqualifyingReasons.push('Requires ownership of cultivable agricultural land in your name');
        disqualifyingReasons.push(`Current recorded occupation is "${profile.occupation || 'Non-agricultural'}"`);
        eligibilityStatus = 'DOES_NOT_MATCH';
        statusHeadline = 'Doesn\'t match the published criteria';
      }
    }

    return {
      ...base,
      eligibilityStatus,
      statusHeadline,
      matchedCriteria,
      missingInfo,
      disqualifyingReasons
    };
  });
}
