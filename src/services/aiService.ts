import { UserProfile, GrievanceDraft, Scheme } from '../types';

export function extractProfileFromText(text: string): UserProfile {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // State detection
  let state = 'Haryana';
  if (lower.includes('haryana') || lower.includes('हरियाणा') || lower.includes('गुड़गांव') || lower.includes('फरीदाबाद') || lower.includes('करनाल') || lower.includes('अंबाला')) {
    state = 'Haryana';
  } else if (lower.includes('delhi') || lower.includes('दिल्ली')) {
    state = 'Delhi';
  } else if (lower.includes('uttar pradesh') || lower.includes('उत्तर प्रदेश') || lower.includes('up') || lower.includes('लखनऊ')) {
    state = 'Uttar Pradesh';
  } else if (lower.includes('rajasthan') || lower.includes('राजस्थान') || lower.includes('जयपुर')) {
    state = 'Rajasthan';
  } else if (lower.includes('bihar') || lower.includes('बिहार') || lower.includes('पटना')) {
    state = 'Bihar';
  } else if (lower.includes('punjab') || lower.includes('पंजाब')) {
    state = 'Punjab';
  } else if (lower.includes('madhya pradesh') || lower.includes('मध्य प्रदेश') || lower.includes('mp')) {
    state = 'Madhya Pradesh';
  }

  // Occupation detection
  let occupation = 'Street Vendor';
  if (lower.includes('स्ट्रीट वेंडर') || lower.includes('street vendor') || lower.includes('वेंडर') || lower.includes('ठेला') || lower.includes('रेहड़ी') || lower.includes('पटरी') || lower.includes('फेरीवाला') || lower.includes('stall') || lower.includes('hawker')) {
    occupation = 'Street Vendor';
  } else if (lower.includes('किसान') || lower.includes('farmer') || lower.includes('खेती') || lower.includes('agriculture')) {
    occupation = 'Farmer';
  } else if (lower.includes('मजदूर') || lower.includes('labor') || lower.includes('labour') || lower.includes('construction') || lower.includes('दिहाड़ी')) {
    occupation = 'Construction Worker';
  } else if (lower.includes('ड्राइवर') || lower.includes('driver') || lower.includes('ऑटो')) {
    occupation = 'Auto / Taxi Driver';
  } else if (lower.includes('दर्जी') || lower.includes('tailor') || lower.includes('सिलाई')) {
    occupation = 'Tailor';
  } else if (lower.includes('दुकान') || lower.includes('shop') || lower.includes('small shop')) {
    occupation = 'Small Shopkeeper';
  } else if (lower.includes('घरेलू कामगार') || lower.includes('maid') || lower.includes('domestic')) {
    occupation = 'Domestic Worker';
  }

  // Monthly income detection
  let monthlyIncome: number | null = null;

  // 1. Contextual income match (with income-related keywords)
  const incomeWithKeywords = clean.match(/(?:कमाई|आय|income|salary|earn|earning|कमा|rupees?|रुपये?|रुपया|₹|rs\.?)\s*(?:है|is|of|करीब|लगभग|around|about|approx)?\s*[:\s-]*(\d+[\d,]*)\s*(हजार|k|thousand|lakh|लाख)?/i)
    || clean.match(/(\d+[\d,]*)\s*(हजार|k|thousand|lakh|लाख)?\s*(?:रुपये?|rupees?|rs\.?|₹)?\s*(?:की\s*कमाई|की\s*आय|per month|\/mo|महीना|महीने|monthly)/i);

  if (incomeWithKeywords) {
    const rawVal = parseInt(incomeWithKeywords[1].replace(/,/g, ''), 10);
    const unit = (incomeWithKeywords[2] || '').toLowerCase();
    if (!isNaN(rawVal)) {
      if (unit.includes('हजार') || unit === 'k' || unit.includes('thousand')) {
        monthlyIncome = rawVal < 1000 ? rawVal * 1000 : rawVal;
      } else if (unit.includes('लाख') || unit.includes('lakh')) {
        monthlyIncome = Math.round((rawVal * 100000) / 12);
      } else {
        monthlyIncome = rawVal;
      }
    }
  }

  // 2. Direct thousand modifier match: e.g. "15 हजार", "15k", "15 thousand"
  if (monthlyIncome === null) {
    const thousandMatch = clean.match(/(\d+[\d,]*)\s*(हजार|k|thousand)/i);
    if (thousandMatch) {
      const rawVal = parseInt(thousandMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(rawVal)) {
        monthlyIncome = rawVal < 1000 ? rawVal * 1000 : rawVal;
      }
    }
  }

  // 3. 4-6 digit standalone numbers (e.g. 15000, 12000, 20000)
  if (monthlyIncome === null) {
    const directNumMatch = clean.match(/\b([1-9]\d{3,5})\b/);
    if (directNumMatch) {
      const rawVal = parseInt(directNumMatch[1], 10);
      if (rawVal >= 2500 && rawVal <= 300000 && rawVal !== 2024 && rawVal !== 2025 && rawVal !== 2026) {
        monthlyIncome = rawVal;
      }
    }
  }

  // 4. Hindi & English word numbers
  if (monthlyIncome === null) {
    if (lower.includes('पंद्रह हजार') || lower.includes('fifteen thousand')) {
      monthlyIncome = 15000;
    } else if (lower.includes('दस हजार') || lower.includes('ten thousand')) {
      monthlyIncome = 10000;
    } else if (lower.includes('बीस हजार') || lower.includes('twenty thousand')) {
      monthlyIncome = 20000;
    } else if (lower.includes('बारह हजार') || lower.includes('twelve thousand')) {
      monthlyIncome = 12000;
    } else if (lower.includes('आठ हजार') || lower.includes('eight thousand')) {
      monthlyIncome = 8000;
    } else if (lower.includes('पच्चीस हजार') || lower.includes('twenty five thousand')) {
      monthlyIncome = 25000;
    }
  }

  // Sensible citizen fallback if completely absent
  if (monthlyIncome === null) {
    monthlyIncome = 15000;
  }

  // Children detection
  let children: number | null = null;
  if (clean.includes('दो बच्चे') || lower.includes('2 child') || lower.includes('2 kid') || lower.includes('दो संतान') || lower.includes('2 बच्चे')) {
    children = 2;
  } else if (clean.includes('एक बच्चा') || lower.includes('1 child') || lower.includes('1 kid') || lower.includes('एक संतान') || lower.includes('1 बच्चा')) {
    children = 1;
  } else if (clean.includes('तीन बच्चे') || lower.includes('3 child') || lower.includes('3 kid') || lower.includes('तीन संतान') || lower.includes('3 बच्चे')) {
    children = 3;
  } else if (clean.includes('चार बच्चे') || lower.includes('4 child') || lower.includes('4 kid') || lower.includes('4 बच्चे')) {
    children = 4;
  } else if (clean.includes('कोई बच्चा नहीं') || lower.includes('no child') || lower.includes('no kids') || lower.includes('0 children')) {
    children = 0;
  } else {
    const childMatch = clean.match(/(\d+)\s*(?:बच्चे|बच्चा|children|kids|child|संतान)/i);
    if (childMatch) {
      children = parseInt(childMatch[1], 10);
    }
  }
  if (children === null) {
    children = 2;
  }

  // Age detection if present
  let age: number | null = null;
  const ageMatch = clean.match(/(\d{1,2})\s*(?:साल|वर्ष|years|year old|yr|उम्र)/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge >= 14 && parsedAge <= 99) {
      age = parsedAge;
    }
  }

  return {
    rawInput: text,
    state,
    occupation,
    monthlyIncome,
    children,
    age,
    urbanRural: 'Urban'
  };
}

export function generateGrievanceDraft(
  scheme: Scheme,
  userProblem: string,
  profile: UserProfile
): GrievanceDraft {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const department = scheme.ministry || 'Public Grievance & Nodal Authority';
  const authority = scheme.id === 'pm-svanidhi'
    ? 'The Municipal Commissioner / Town Vending Officer'
    : scheme.id === 'mmpsy-haryana'
    ? 'The District Nodal Officer, Parivar Pehchan Patra & MMPSY'
    : 'The Competent Public Grievance Redressal Officer';

  const subject = `Regarding Delay / Grievance in Scheme Facilitation under ${scheme.name}`;

  const bodyText = `To,
${authority}
${department}
Government of India / Government of ${profile.state}

Date: ${currentDate}

Subject: ${subject}

Respected Sir / Madam,

I am writing to formally bring to your kind notice an issue I am facing regarding the ${scheme.name} (${scheme.hindiName}).

1. Applicant Profile:
- Occupation: ${profile.occupation}
- State of Residence: ${profile.state}
- Approximate Monthly Income: ₹${profile.monthlyIncome?.toLocaleString('en-IN') || 'Not declared'}
- Family Size: Dependent family including ${profile.children ?? 0} children

2. Nature of the Grievance:
"${userProblem.trim()}"

3. Submission Summary:
I meet the designated criteria for this scheme and have duly prepared/submitted the necessary verification documents. However, I have not received a timely resolution or disbursement status update as per the Citizen Charter guidelines.

4. Prayer / Relief Sought:
I earnestly request your good office to kindly inspect my application status, expedite any pending verification at the field or municipal level, and disburse the eligible benefit/status acknowledgment at the earliest.

Thanking you in anticipation.

Yours faithfully,
[Applicant Name / हस्ताक्षर]
Contact: [Mobile Number]
Aadhaar Linked Address: [Resident of ${profile.state}]`;

  return {
    toAuthority: authority,
    department,
    subject,
    body: bodyText,
    applicantName: '[Your Name]',
    applicantDetails: `${profile.occupation}, ${profile.state}`,
    date: currentDate,
    schemeId: scheme.id,
    schemeName: scheme.name
  };
}
