import { Scheme, UserProfile, EligibilityStatus } from '../types.ts';

export const POPULAR_SCHEMES: Scheme[] = [
  {
    id: 'pm-svanidhi',
    scheme_id: 1,
    name: 'PM SVANidhi (PM Street Vendor’s AtmaNirbhar Nidhi)',
    nameHi: 'पीएम स्वनिधि (प्रधानमंत्री स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
    ministry: 'Ministry of Housing and Urban Affairs',
    ministryHi: 'आवासन और शहरी कार्य मंत्रालय, भारत सरकार',
    category: 'livelihood',
    categoryLabel: 'Urban Livelihood & Street Vendors',
    categoryLabelHi: 'शहरी आजीविका एवं स्ट्रीट वेंडर्स',
    status: 'eligible',
    statusLabel: 'You may qualify',
    statusLabelHi: 'आप पात्र हो सकते हैं',
    brief: 'Collateral-free working capital micro-credit loan up to ₹50,000 with 7% interest subsidy and cashback incentives on digital transactions.',
    briefHi: 'रेहड़ी-पटरी विक्रेताओं के लिए ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण, 7% ब्याज सब्सिडी एवं डिजिटल लेनदेन पर कैशबैक।',
    benefits: 'Initial loan of ₹10,000 (1st tranche), followed by ₹20,000 (2nd tranche) and ₹50,000 (3rd tranche) on timely repayment. 7% interest subsidy credited directly to bank account.',
    benefitsHi: 'समय पर पुनर्भुगतान पर ₹10,000 (पहली किश्त), ₹20,000 (दूसरी किश्त) और ₹50,000 (तीसरी किश्त) का लोन। 7% ब्याज सब्सिडी सीधे खाते में।',
    qualifyReasons: [
      'You are a street vendor / vendor operating in urban area',
      'You are a resident of Haryana (all states/UTs covered)',
      'Income profile falls within eligible working capital range'
    ],
    qualifyReasonsHi: [
      'आप स्ट्रीट वेंडर / शहरी क्षेत्र में विक्रेता हैं ✓',
      'आप हरियाणा के निवासी हैं (सभी राज्य/केंद्र शासित प्रदेश मान्य) ✓',
      'आय सीमा कार्यशील पूंजी पात्रता के अनुकूल है ✓'
    ],
    infoNeeded: [
      'Certificate of Vending (CoV) or Letter of Recommendation (LoR) from Urban Local Body / Municipality',
      'Vending location details / ward number'
    ],
    infoNeededHi: [
      'शहरी स्थानीय निकाय / नगर पालिका द्वारा जारी विक्रय प्रमाण पत्र (CoV) अथवा सिफारिश पत्र (LoR)',
      'वेंडिंग स्थल का विवरण / वार्ड संख्या'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card (Linked with active mobile number)', nameHi: 'आधार कार्ड (सक्रिय मोबाइल नंबर से लिंक)', isMandatory: true },
      { name: 'Certificate of Vending / ID Card / LoR issued by ULB', nameHi: 'विक्रय प्रमाण पत्र / पहचान पत्र / नगर पालिका द्वारा जारी LoR', isMandatory: true },
      { name: 'Active Savings Bank Account Passbook / Cancelled Cheque', nameHi: 'सक्रिय बचत बैंक खाता पासबुक / चेक', isMandatory: true },
      { name: 'UPI QR code / Digital payment handle', nameHi: 'यूपीआई क्यूआर कोड / डिजिटल भुगतान हैंडल', isMandatory: false }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Obtain Certificate of Vending or LoR',
        titleHi: 'विक्रय प्रमाण पत्र या सिफारिश पत्र प्राप्त करें',
        description: 'Contact your local Municipal Corporation / Committee or ward office for vending survey confirmation.',
        descriptionHi: 'अपने स्थानीय नगर निगम / समिति अथवा वार्ड कार्यालय से संपर्क कर वेंडिंग पुष्टि प्राप्त करें।'
      },
      {
        stepNumber: 2,
        title: 'Visit Common Service Centre (CSC) or PMSVANidhi Portal',
        titleHi: 'सीएससी केंद्र या पीएम स्वनिधि पोर्टल पर जाएं',
        description: 'Apply online at pmsvanidhi.mohua.gov.in or visit the nearest Citizen Service Centre with Aadhaar.',
        descriptionHi: 'pmsvanidhi.mohua.gov.in पर ऑनलाइन आवेदन करें या आधार के साथ नजदीकी सीएससी पर जाएं।'
      },
      {
        stepNumber: 3,
        title: 'Select Preferred Lending Institution & Complete e-KYC',
        titleHi: 'पसंदीदा बैंक का चयन करें एवं ई-केवाईसी पूर्ण करें',
        description: 'Choose your local nationalized bank or rural bank branch for instant digital disbursement into your account.',
        descriptionHi: 'अपने स्थानीय बैंक शाखा का चयन करें, सत्यापन के बाद ऋण राशि सीधे खाते में भेजी जाएगी।'
      }
    ],
    sourceName: 'Official Ministry of Housing and Urban Affairs (MoHUA)',
    sourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    lastVerified: '15/09/2026',
    targetOccupations: ['street vendor', 'vendor', 'hawker', 'seller', 'ठेला', 'दुकानदार', 'फेरीवाला', 'वेंडर'],
    maxIncome: 250000,
    featured: true
  },
  {
    id: 'ayushman-bharat',
    scheme_id: 2,
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    nameHi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (एबी-पीएमजेएवाई)',
    ministry: 'National Health Authority, Ministry of Health and Family Welfare',
    ministryHi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण, स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
    category: 'healthcare',
    categoryLabel: 'Health & Family Welfare',
    categoryLabelHi: 'स्वास्थ्य एवं परिवार कल्याण',
    status: 'eligible',
    statusLabel: 'You may qualify',
    statusLabelHi: 'आप पात्र हो सकते हैं',
    brief: 'Cashless healthcare coverage of up to ₹5,00,000 per family per year for secondary and tertiary hospital care at empaneled hospitals.',
    briefHi: 'प्रति परिवार प्रति वर्ष ₹5,00,000 तक का मुफ्त कैशलेस स्वास्थ्य उपचार, सभी सूचीबद्ध सरकारी एवं निजी अस्पतालों में मान्य।',
    benefits: 'Covers pre-existing conditions from day one, medicine expenses, diagnostics, ICU charges, and major surgeries across 27,000+ empaneled hospitals across India.',
    benefitsHi: 'पहले दिन से सभी बीमारियां कवर, 27,000+ अस्पतालों में दवा, जांच, आईसीयू और प्रमुख सर्जरी का खर्च शामिल।',
    qualifyReasons: [
      'Low income / EWS category criteria satisfied (Monthly income under ₹20,000)',
      'Urban informal worker / street vendor eligible under SECC / state deprivation metrics',
      'Family size with 2 dependent children prioritizes health coverage'
    ],
    qualifyReasonsHi: [
      'कम आय / ईडब्ल्यूएस श्रेणी मापदंड अनुकूल (मासिक आय ₹20,000 से कम) ✓',
      'शहरी असंगठित क्षेत्र कार्यकर्ता पात्रता सूची के अंतर्गत ✓',
      'दो आश्रित बच्चों वाले परिवार हेतु प्राथमिकता स्वास्थ्य सुरक्षा ✓'
    ],
    infoNeeded: [
      'Ration Card / Parivar Pehchan Patra (PPP) for Haryana residents',
      'Biometric e-KYC validation at hospital or CSC'
    ],
    infoNeededHi: [
      'राशन कार्ड / हरियाणा परिवार पहचान पत्र (PPP)',
      'नजदीकी अस्पताल या सीएससी पर बायोमेट्रिक ई-केवाईसी'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card of all family members', nameHi: 'परिवार के सभी सदस्यों का आधार कार्ड', isMandatory: true },
      { name: 'Ration Card / State Family ID (PPP Haryana)', nameHi: 'राशन कार्ड / परिवार पहचान पत्र (हरियाणा)', isMandatory: true },
      { name: 'Active Mobile Number for OTP', nameHi: 'ओटीपी हेतु सक्रिय मोबाइल नंबर', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Check Name on PMJAY / Chirayu Haryana Database',
        titleHi: 'पीएमजेएवाई / चिरायु हरियाणा डेटाबेस में नाम जांचें',
        description: 'Use the official portal beneficiary.nha.gov.in or visit any empaneled hospital helpdesk.',
        descriptionHi: 'आधिकारिक पोर्टल beneficiary.nha.gov.in पर या अस्पताल के आयुष्मान मित्र काउंटर पर नाम चेक करें।'
      },
      {
        stepNumber: 2,
        title: 'Complete Biometric e-KYC',
        titleHi: 'बायोमेट्रिक ई-केवाईसी पूर्ण करें',
        description: 'Verify identity through fingerprint or Iris scan at your local hospital or CSC.',
        descriptionHi: 'नजदीकी सरकारी अस्पताल या सीएससी केंद्र पर बायोमेट्रिक फिंगरप्रिंट से सत्यापन कराएं।'
      },
      {
        stepNumber: 3,
        title: 'Download Ayushman Gold Card',
        titleHi: 'आयुष्मान गोल्डन कार्ड डाउनलोड करें',
        description: 'Receive your laminated PVC card or digital card for lifetime cashless health insurance.',
        descriptionHi: 'कैशलेस इलाज के लिए अपना आयुष्मान गोल्डन कार्ड प्राप्त करें।'
      }
    ],
    sourceName: 'National Health Authority (NHA) & Ministry of Health',
    sourceUrl: 'https://beneficiary.nha.gov.in',
    lastVerified: '12/09/2026',
    targetOccupations: ['all', 'street vendor', 'laborer', 'artisan', 'driver', 'domestic worker', 'farmer'],
    maxIncome: 180000,
    featured: true
  },
  {
    id: 'pm-vishwakarma',
    scheme_id: 3,
    name: 'PM Vishwakarma Scheme',
    nameHi: 'पीएम विश्वकर्मा योजना (पारंपरिक कारीगर एवं शिल्पकार)',
    ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    ministryHi: 'सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय, भारत सरकार',
    category: 'skill_artisan',
    categoryLabel: 'Traditional Artisans & Craftsmen',
    categoryLabelHi: 'पारंपरिक कारीगर एवं शिल्पकार',
    status: 'need_info',
    statusLabel: 'More information needed',
    statusLabelHi: 'अधिक जानकारी की आवश्यकता है',
    brief: 'End-to-end holistic support to traditional artisans: ₹15,000 toolkit incentive, basic & advanced skilling stipend of ₹500/day, and collateral-free loans up to ₹3,00,000 at 5%.',
    briefHi: '18 पारंपरिक शिल्पों के कारीगरों को ₹15,000 टूलकिट सहायता, ₹500 प्रतिदिन कौशल प्रशिक्षण मानदेय, और 5% रियायती दर पर ₹3 लाख तक का ऋण।',
    benefits: 'Formal recognition as Vishwakarma through PM Vishwakarma Certificate & ID, advanced skill training, marketing support on GeM portal.',
    benefitsHi: 'पीएम विश्वकर्मा प्रमाण पत्र व आईडी, उन्नत कौशल प्रशिक्षण, ₹15,000 का टूलकिट अनुदान व 5% ब्याज पर ऋण।',
    qualifyReasons: [
      'Self-employed informal sector profile matches scheme framework'
    ],
    qualifyReasonsHi: [
      'स्वरोजगार अनौपचारिक क्षेत्र कार्य प्रोफ़ाइल योजना के अनुकूल है'
    ],
    infoNeeded: [
      'Specific traditional craft / trade specification (Must belong to one of 18 identified trades like Carpenter, Cobbler, Tailor, Barber, Basket maker, etc.)',
      'Gram Panchayat / Urban Local Body 3-tier committee verification'
    ],
    infoNeededHi: [
      'विशिष्ट पारंपरिक शिल्प / व्यवसाय की जानकारी (18 चिन्हित व्यवसायों जैसे मोची, बढ़ई, दर्जी, नाई, टोकरी बुनकर आदि में से एक होना चाहिए)',
      'ग्राम पंचायत या नगर पालिका स्तरीय तीन-स्तरीय सत्यापन रिपोर्ट'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', nameHi: 'आधार कार्ड', isMandatory: true },
      { name: 'Active Bank Passbook', nameHi: 'सक्रिय बैंक पासबुक', isMandatory: true },
      { name: 'Skill / Trade declaration', nameHi: 'पारंपरिक शिल्प घोषणा पत्र', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Confirm Eligibility Under 18 Identified Trades',
        titleHi: '18 चिन्हित पारंपरिक शिल्पों में अपना व्यवसाय जांचें',
        description: 'Verify if your vending/trade matches cobbler (charmakar), tailor (darzi), or toy/basket making.',
        descriptionHi: 'जांचें कि क्या आपका व्यवसाय मोची, दर्जी, मालाकार या टोकरी बनाने से संबंधित है।'
      },
      {
        stepNumber: 2,
        title: 'Register at CSC with Aadhaar & Trade Details',
        titleHi: 'सीएससी केंद्र पर आधार व शिल्प विवरण के साथ पंजीकरण कराएं',
        description: 'CSC operator submits your application to ULB / Gram Panchayat committee.',
        descriptionHi: 'सीएससी संचालक द्वारा आपका आवेदन स्थानीय सत्यापन समिति को भेजा जाएगा।'
      }
    ],
    sourceName: 'Ministry of MSME, Govt. of India',
    sourceUrl: 'https://pmvishwakarma.gov.in',
    lastVerified: '10/09/2026',
    targetOccupations: ['artisan', 'carpenter', 'cobbler', 'tailor', 'barber', 'blacksmith', 'potter', 'कारीगर', 'दर्जी', 'मोची'],
    maxIncome: 300000,
    featured: true
  },
  {
    id: 'sukanya-samriddhi',
    scheme_id: 4,
    name: 'Sukanya Samriddhi Yojana (Beti Bachao Beti Padhao)',
    nameHi: 'सुकन्या समृद्धि योजना (बेटी बचाओ बेटी पढ़ाओ)',
    ministry: 'Ministry of Finance & Department of Posts',
    ministryHi: 'वित्त मंत्रालय एवं डाक विभाग, भारत सरकार',
    category: 'women_child',
    categoryLabel: 'Women & Child Welfare',
    categoryLabelHi: 'महिला एवं बाल विकास',
    status: 'need_info',
    statusLabel: 'More information needed',
    statusLabelHi: 'अधिक जानकारी की आवश्यकता है',
    brief: 'High-interest (8.2% p.a.) government-backed savings scheme for girl children with complete triple tax exemption (EEE) under Section 80C.',
    briefHi: 'बालिकाओं के उज्ज्वल भविष्य के लिए 8.2% वार्षिक ब्याज वाली सरकारी बचत योजना, जिसमें धारा 80सी के तहत पूर्ण कर छूट मिलती है।',
    benefits: 'Guaranteed government interest rate, maturity when girl turns 21, partial withdrawal up to 50% for higher education upon reaching age 18.',
    benefitsHi: '8.2% की सुरक्षित ब्याज दर, 21 वर्ष की आयु पर परिपक्वता, उच्च शिक्षा हेतु 18 वर्ष की आयु पर 50% तक निकासी की सुविधा।',
    qualifyReasons: [
      'Parent of dependent children matches guardian eligibility'
    ],
    qualifyReasonsHi: [
      'आश्रित बच्चों के अभिभावक के रूप में प्रारंभिक पात्रता पूरी होती है'
    ],
    infoNeeded: [
      'Gender and age of your 2 children (Eligible only for girl children below 10 years of age)',
      'Birth certificate of the girl child'
    ],
    infoNeededHi: [
      'आपके दोनों बच्चों का लिंग एवं आयु विवरण (केवल 10 वर्ष से कम आयु की बालिकाओं के लिए मान्य)',
      'बालिका का जन्म प्रमाण पत्र'
    ],
    requiredDocuments: [
      { name: 'Girl Child Birth Certificate', nameHi: 'बालिका का जन्म प्रमाण पत्र', isMandatory: true },
      { name: 'Aadhaar & Identity proof of Parent/Guardian', nameHi: 'अभिभावक/माता-पिता का आधार एवं पहचान पत्र', isMandatory: true },
      { name: 'Address Proof & Photographs', nameHi: 'निवास प्रमाण पत्र एवं पासपोर्ट साइज फोटो', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Provide Children Gender & Age Details',
        titleHi: 'बच्चों का लिंग और आयु विवरण साझा करें',
        description: 'Update your profile to specify if any of your two children is a girl under 10 years.',
        descriptionHi: 'प्रोफ़ाइल में पुष्टि करें कि क्या आपकी कोई संतान 10 वर्ष से कम आयु की बेटी है।'
      },
      {
        stepNumber: 2,
        title: 'Visit Nearest India Post Branch or Public Bank',
        titleHi: 'नजदीकी डाकघर या राष्ट्रीयकृत बैंक शाखा में जाएं',
        description: 'Open the account with an initial deposit starting from as low as ₹250.',
        descriptionHi: 'मात्र ₹250 की न्यूनतम राशि से अपनी बेटी के नाम खाता खुलवाएं।'
      }
    ],
    sourceName: 'Department of Posts & Ministry of Finance',
    sourceUrl: 'https://www.indiapost.gov.in',
    lastVerified: '01/09/2026',
    targetOccupations: ['all'],
    featured: true
  },
  {
    id: 'pm-awas-urban',
    scheme_id: 5,
    name: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)',
    nameHi: 'प्रधानमंत्री आवास योजना - शहरी 2.0 (पीएमएवाई-यू)',
    ministry: 'Ministry of Housing and Urban Affairs',
    ministryHi: 'आवासन और शहरी कार्य मंत्रालय',
    category: 'housing',
    categoryLabel: 'Housing & Urban Development',
    categoryLabelHi: 'आवास एवं शहरी विकास',
    status: 'eligible',
    statusLabel: 'You may qualify',
    statusLabelHi: 'आप पात्र हो सकते हैं',
    brief: 'Financial assistance of up to ₹2.5 Lakh for constructing or acquiring a pucca house for Economically Weaker Section (EWS) urban families.',
    briefHi: 'शहरी क्षेत्र के आर्थिक रूप से कमजोर वर्ग (ईडब्ल्यूएस) के परिवारों को पक्का मकान बनाने या खरीदने हेतु ₹2.5 लाख तक की केंद्रीय सहायता।',
    benefits: 'Direct subsidy for self-construction or subsidized interest rate on home loans. Preference given to families with dependent children, street vendors, and single women.',
    benefitsHi: 'मकान निर्माण हेतु सीधे बैंक खाते में वित्तीय सहायता। स्ट्रीट वेंडर्स एवं बच्चों वाले परिवारों को विशेष प्राथमिकता।',
    qualifyReasons: [
      'Monthly income of ₹15,000 falls comfortably within EWS limit (< ₹3,00,000 annual)',
      'Urban resident with dependent family of 4 members',
      'Street vendor occupation classified under priority beneficiary category'
    ],
    qualifyReasonsHi: [
      'मासिक आय ₹15,000 ईडब्ल्यूएस सीमा (< ₹3 लाख वार्षिक) के अनुकूल है ✓',
      '4 सदस्यों वाले परिवार के साथ शहरी निवासी ✓',
      'स्ट्रीट वेंडर व्यवसाय प्राथमिकता प्राप्त श्रेणी में शामिल ✓'
    ],
    infoNeeded: [
      'Declaration of not owning a pucca house in any part of India',
      'Land ownership or municipal occupancy certificate if applying for beneficiary-led construction'
    ],
    infoNeededHi: [
      'भारत में कहीं भी पक्का मकान न होने का स्व-प्रमाणित शपथ पत्र',
      'स्वयं के मकान निर्माण हेतु भूमि स्वामित्व या पट्टा दस्तावेज'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card of all family members', nameHi: 'परिवार के सभी सदस्यों का आधार कार्ड', isMandatory: true },
      { name: 'Income Certificate / Self-Declaration', nameHi: 'आय प्रमाण पत्र / स्व-घोषणा', isMandatory: true },
      { name: 'Bank Account Passbook (Aadhaar Seeded)', nameHi: 'बैंक पासबुक (आधार से लिंक)', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Check Ward Survey with Municipal Committee',
        titleHi: 'नगर पालिका में वार्ड आवास सर्वेक्षण की जांच करें',
        description: 'Verify if your ward has active PMAY-U 2.0 beneficiary registration camps.',
        descriptionHi: 'जांचें कि क्या आपके वार्ड में पीएम आवास योजना के तहत पंजीकरण शिविर सक्रिय है।'
      },
      {
        stepNumber: 2,
        title: 'Submit Online Application via PMAY-MIS Portal or CSC',
        titleHi: 'पीएमएवाई-एमआईएस पोर्टल अथवा सीएससी से आवेदन करें',
        description: 'Fill the Citizen Assessment form with your Aadhaar and family details.',
        descriptionHi: 'नागरिक मूल्यांकन फॉर्म में आधार और पारिवारिक विवरण दर्ज करें।'
      }
    ],
    sourceName: 'Ministry of Housing and Urban Affairs (MoHUA)',
    sourceUrl: 'https://pmaymis.gov.in',
    lastVerified: '14/09/2026',
    targetOccupations: ['street vendor', 'laborer', 'driver', 'artisan', 'all'],
    maxIncome: 300000,
    featured: true
  },
  {
    id: 'pm-kisan',
    scheme_id: 6,
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    nameHi: 'पीएम-किसान सम्मान निधि (प्रधानमंत्री किसान सम्मान निधि)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    ministryHi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार',
    category: 'agriculture',
    categoryLabel: 'Agriculture & Farmers Welfare',
    categoryLabelHi: 'कृषि एवं किसान कल्याण',
    status: 'ineligible',
    statusLabel: 'Doesn’t match published criteria',
    statusLabelHi: 'प्रकाशित पात्रता मानदंडों से मेल नहीं खाता',
    brief: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
    briefHi: 'सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता, 3 समान किस्तों (प्रत्येक ₹2,000) में सीधे खाते में।',
    benefits: '₹2,000 credited every 4 months directly into Aadhaar-seeded bank account through Direct Benefit Transfer (DBT).',
    benefitsHi: 'हर 4 महीने में ₹2,000 सीधे बैंक खाते में डीबीटी के माध्यम से अंतरित।',
    qualifyReasons: [],
    qualifyReasonsHi: [],
    infoNeeded: [],
    infoNeededHi: [],
    ineligibleReasons: [
      'Beneficiary must be a farmer possessing cultivable agricultural land registered in state land revenue records (Khasra/Khatauni).',
      'Your recorded occupation is "Street Vendor" with no registered agricultural land holding.'
    ],
    ineligibleReasonsHi: [
      'लाभार्थी के नाम राज्य भू-राजस्व रिकॉर्ड (खसरा/खतौनी) में कृषि योग्य भूमि दर्ज होनी आवश्यक है।',
      'आपका दर्ज व्यवसाय "स्ट्रीट वेंडर" है एवं कोई कृषि भूमि स्वामित्व उपलब्ध नहीं है।'
    ],
    requiredDocuments: [
      { name: 'Land Ownership Document (Jamabandi / Khasra Khatauni)', nameHi: 'कृषि भूमि स्वामित्व दस्तावेज (जमाबंदी / खसरा खतौनी)', isMandatory: true },
      { name: 'Aadhaar Card', nameHi: 'आधार कार्ड', isMandatory: true },
      { name: 'e-KYC verification', nameHi: 'ई-केवाईसी सत्यापन', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Requirement for Land Registration',
        titleHi: 'कृषि भूमि पंजीकरण की अनिवार्यता',
        description: 'If you or your spouse own agricultural land in your native village, update your profile with agricultural land details.',
        descriptionHi: 'यदि आपके या आपके जीवनसाथी के नाम पैतृक गांव में कृषि भूमि है, तो प्रोफ़ाइल में भूमि विवरण जोड़ें।'
      }
    ],
    sourceName: 'Ministry of Agriculture & Farmers Welfare',
    sourceUrl: 'https://pmkisan.gov.in',
    lastVerified: '08/09/2026',
    targetOccupations: ['farmer', 'kisan', 'agriculture', 'किसान', 'खेती'],
    featured: false
  },
  {
    id: 'e-shram-card',
    scheme_id: 7,
    name: 'e-Shram (National Database of Unorganized Workers)',
    nameHi: 'ई-श्रम (असंगठित कामगारों का राष्ट्रीय डेटाबेस)',
    ministry: 'Ministry of Labour & Employment',
    ministryHi: 'श्रम एवं रोजगार मंत्रालय, भारत सरकार',
    category: 'social_security',
    categoryLabel: 'Social Security & Labour',
    categoryLabelHi: 'सामाजिक सुरक्षा एवं श्रम',
    status: 'eligible',
    statusLabel: 'You may qualify',
    statusLabelHi: 'आप पात्र हो सकते हैं',
    brief: '12-digit Universal Account Number (UAN) for unorganized workers providing social security benefits and accidental insurance cover of ₹2,00,000.',
    briefHi: 'असंगठित क्षेत्र के कामगारों के लिए 12 अंकों का यूनिवर्सल अकाउंट नंबर (UAN) और ₹2,00,000 का दुर्घटना बीमा कवर।',
    benefits: 'Direct access to pension (PM-SYM), disability assistance, emergency relief during natural disasters, and portable national identity across states.',
    benefitsHi: 'पेंशन योजना, आपातकालीन आपदा राहत और देश के किसी भी राज्य में मान्य राष्ट्रीय पहचान पत्र।',
    qualifyReasons: [
      'Street vendor is an officially notified unorganized worker category',
      'Age between 16-59 years and not an income tax payer',
      'Not a member of EPFO / ESIC'
    ],
    qualifyReasonsHi: [
      'स्ट्रीट वेंडर आधिकारिक रूप से असंगठित कामगार श्रेणी में अधिसूचित है ✓',
      'आयकर दाता न होने की शर्त पूरी होती है ✓',
      'ईपीएफओ / ईएसआईसी का सदस्य न होने की शर्त पूरी है ✓'
    ],
    infoNeeded: [
      'Bank account seeded with Aadhaar',
      'Nominee details for insurance coverage'
    ],
    infoNeededHi: [
      'आधार से लिंक बैंक खाता',
      'बीमा कवरेज हेतु नॉमिनी का विवरण'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Number with OTP authentication', nameHi: 'आधार नंबर (ओटीपी प्रमाणीकरण सहित)', isMandatory: true },
      { name: 'Bank Account Number with IFSC Code', nameHi: 'बैंक खाता नंबर एवं आईएफएससी कोड', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Self-Enroll at eshram.gov.in',
        titleHi: 'eshram.gov.in पर स्वयं पंजीकरण करें',
        description: 'Complete registration in 3 minutes using Aadhaar OTP verification.',
        descriptionHi: 'आधार ओटीपी सत्यापन द्वारा मात्र 3 मिनट में अपना पंजीकरण पूरा करें।'
      },
      {
        stepNumber: 2,
        title: 'Download e-Shram Digital UAN Card',
        titleHi: 'डिजिटल ई-श्रम यूएएन कार्ड डाउनलोड करें',
        description: 'Keep your UAN card handy for direct welfare transfers and social security schemes.',
        descriptionHi: 'भविष्य की सभी सरकारी कल्याणकारी योजनाओं के सीधे लाभ के लिए यूएएन कार्ड सुरक्षित रखें।'
      }
    ],
    sourceName: 'Ministry of Labour & Employment, Govt. of India',
    sourceUrl: 'https://eshram.gov.in',
    lastVerified: '11/09/2026',
    targetOccupations: ['street vendor', 'laborer', 'domestic worker', 'driver', 'carpenter', 'vendor'],
    maxIncome: 250000,
    featured: true
  },
  {
    id: 'lakhpati-didi',
    scheme_id: 8,
    name: 'Lakhpati Didi (Deendayal Antyodaya Yojana - DAY-NRLM/NULM)',
    nameHi: 'लखपति दीदी (दीनदयाल अंत्योदय योजना)',
    ministry: 'Ministry of Rural Development / Housing & Urban Affairs',
    ministryHi: 'ग्रामीण विकास मंत्रालय / आवासन और शहरी कार्य मंत्रालय',
    category: 'women_child',
    categoryLabel: 'Women Empowerment & Self Help',
    categoryLabelHi: 'महिला सशक्तिकरण एवं स्वयं सहायता समूह',
    status: 'need_info',
    statusLabel: 'More information needed',
    statusLabelHi: 'अधिक जानकारी की आवश्यकता है',
    brief: 'Empowering women members of Self Help Groups (SHGs) to earn a sustainable income of at least ₹1 Lakh per year through micro-enterprises and credit support.',
    briefHi: 'स्वयं सहायता समूहों की महिला सदस्यों को सूक्ष्म उद्यमों, प्रशिक्षण और रियायती ऋण के माध्यम से न्यूनतम ₹1 लाख वार्षिक आय अर्जित करने में सक्षम बनाना।',
    benefits: 'Community investment fund, enterprise training, digital financial literacy, and market linkages with e-commerce platforms.',
    benefitsHi: 'सामुदायिक निवेश निधि, व्यवसाय प्रशिक्षण, डिजिटल वित्तीय साक्षरता और ई-कॉमर्स बाजार से जुड़ाव।',
    qualifyReasons: [
      'Family income profile eligible for poverty alleviation programs'
    ],
    qualifyReasonsHi: [
      'पारिवारिक आय सीमा गरीबी उन्मूलन कार्यक्रमों के अनुकूल है'
    ],
    infoNeeded: [
      'Self Help Group (SHG) membership status of adult female family member',
      'Name of local Area Level Federation / SHG in your municipal ward'
    ],
    infoNeededHi: [
      'परिवार की महिला सदस्य की स्वयं सहायता समूह (SHG) सदस्यता स्थिति',
      'स्थानीय वार्ड अथवा ग्राम संगठन का नाम'
    ],
    requiredDocuments: [
      { name: 'SHG Member Passbook / Group ID', nameHi: 'एसएचजी सदस्य पासबुक / समूह आईडी', isMandatory: true },
      { name: 'Aadhaar Card of Female Beneficiary', nameHi: 'महिला लाभार्थी का आधार कार्ड', isMandatory: true }
    ],
    nextSteps: [
      {
        stepNumber: 1,
        title: 'Check Local SHG in Ward / Municipality',
        titleHi: 'अपने वार्ड या नगर पालिका में सक्रिय महिला समूह से जुड़ें',
        description: 'Connect with community organizers to enroll your spouse/female member into an SHG.',
        descriptionHi: 'सामुदायिक संगठनकर्ता से मिलकर परिवार की महिला सदस्य को स्वयं सहायता समूह में जोड़ें।'
      }
    ],
    sourceName: 'Ministry of Rural Development & MoHUA',
    sourceUrl: 'https://nrlm.gov.in',
    lastVerified: '05/09/2026',
    targetOccupations: ['women', 'shg', 'artisan', 'all'],
    featured: false
  }
];

export function extractProfileFromText(text: string, inputMode: 'voice' | 'text' = 'text'): UserProfile {
  const lower = text.toLowerCase();
  
  // Default values matching sample user or parsed
  let state = 'Haryana';
  let occupation = 'Street Vendor';
  let monthlyIncome = 15000;
  let children = 2;
  
  // State detection
  if (lower.includes('हरियाणा') || lower.includes('haryana')) {
    state = 'Haryana';
  } else if (lower.includes('दिल्ली') || lower.includes('delhi')) {
    state = 'Delhi';
  } else if (lower.includes('उत्तर प्रदेश') || lower.includes('up') || lower.includes('uttar pradesh')) {
    state = 'Uttar Pradesh';
  } else if (lower.includes('बिहार') || lower.includes('bihar')) {
    state = 'Bihar';
  } else if (lower.includes('राजस्थान') || lower.includes('rajasthan')) {
    state = 'Rajasthan';
  } else if (lower.includes('पंजाब') || lower.includes('punjab')) {
    state = 'Punjab';
  } else if (lower.includes('मध्य प्रदेश') || lower.includes('madhya pradesh') || lower.includes('mp')) {
    state = 'Madhya Pradesh';
  } else if (lower.includes('महाराष्ट्र') || lower.includes('maharashtra')) {
    state = 'Maharashtra';
  }

  // Occupation detection
  if (lower.includes('स्ट्रीट वेंडर') || lower.includes('street vendor') || lower.includes('रेहड़ी') || lower.includes('पटरी') || lower.includes('ठेला') || lower.includes('फेरी')) {
    occupation = 'Street Vendor';
  } else if (lower.includes('किसान') || lower.includes('farmer') || lower.includes('खेती')) {
    occupation = 'Farmer';
  } else if (lower.includes('मजदूर') || lower.includes('laborer') || lower.includes('labour') || lower.includes('श्रमिक')) {
    occupation = 'Daily Wage Laborer';
  } else if (lower.includes('कारीगर') || lower.includes('artisan') || lower.includes('दर्जी') || lower.includes('tailor') || lower.includes('बढ़ई') || lower.includes('carpenter')) {
    occupation = 'Traditional Artisan';
  } else if (lower.includes('ड्राइवर') || lower.includes('driver') || lower.includes('ऑटो')) {
    occupation = 'Auto / Commercial Driver';
  } else if (lower.includes('दुकान') || lower.includes('shopkeeper') || lower.includes('व्यापारी')) {
    occupation = 'Small Shopkeeper';
  }

  // Income detection
  const income15Matches = lower.match(/(15\s*हजार|15000|15,000|15\s*k|fifteen thousand)/i);
  const income10Matches = lower.match(/(10\s*हजार|10000|10,000|10\s*k|ten thousand)/i);
  const income20Matches = lower.match(/(20\s*हजार|20000|20,000|20\s*k|twenty thousand)/i);
  const incomeGeneric = lower.match(/(\d+)\s*(हजार|k|thousand)/i);
  
  if (income15Matches) {
    monthlyIncome = 15000;
  } else if (income10Matches) {
    monthlyIncome = 10000;
  } else if (income20Matches) {
    monthlyIncome = 20000;
  } else if (incomeGeneric && incomeGeneric[1]) {
    monthlyIncome = parseInt(incomeGeneric[1], 10) * 1000;
  }

  // Children detection
  if (lower.includes('दो बच्चे') || lower.includes('2 बच्चे') || lower.includes('two children') || lower.includes('2 children') || lower.includes('2 kids')) {
    children = 2;
  } else if (lower.includes('एक बच्चा') || lower.includes('1 बच्चा') || lower.includes('one child') || lower.includes('1 child')) {
    children = 1;
  } else if (lower.includes('तीन बच्चे') || lower.includes('3 बच्चे') || lower.includes('three children') || lower.includes('3 children')) {
    children = 3;
  } else if (lower.includes('चार बच्चे') || lower.includes('4 बच्चे') || lower.includes('four children') || lower.includes('4 children')) {
    children = 4;
  }

  // Gender detection
  let gender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';
  if (lower.includes('महिला') || lower.includes('स्त्री') || lower.includes('female') || lower.includes('woman') || lower.includes('mother') || lower.includes('माता')) {
    gender = 'FEMALE';
  }

  // Age detection
  let age = 34;
  const ageMatch = lower.match(/(?:age|उम्र|आयु)\s*(?:is|है|:)?\s*(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge > 0 && parsedAge <= 120) {
      age = parsedAge;
    }
  }

  return {
    name: 'नागरिक / Citizen',
    state,
    occupation,
    monthly_income: monthlyIncome,
    monthlyIncome,
    children_count: children,
    children,
    age,
    gender,
    rawInput: text,
    inputMode
  };
}

export function evaluateSchemesForProfile(profile: UserProfile): Scheme[] {
  const currentIncome = profile.monthly_income ?? profile.monthlyIncome ?? 15000;
  return POPULAR_SCHEMES.map(scheme => {
    // Clone scheme
    const updated = { ...scheme };
    const isVendor = profile.occupation.toLowerCase().includes('vendor') || profile.occupation.toLowerCase().includes('वेंडर');
    const isFarmer = profile.occupation.toLowerCase().includes('farmer') || profile.occupation.toLowerCase().includes('किसान');
    
    if (scheme.id === 'pm-svanidhi') {
      if (isVendor) {
        updated.status = 'eligible';
        updated.statusLabel = 'You may qualify';
        updated.statusLabelHi = 'आप पात्र हो सकते हैं';
      } else {
        updated.status = 'ineligible';
        updated.statusLabel = 'Doesn’t match published criteria';
        updated.statusLabelHi = 'प्रकाशित पात्रता मानदंडों से मेल नहीं खाता';
      }
    } else if (scheme.id === 'pm-kisan') {
      if (isFarmer) {
        updated.status = 'eligible';
        updated.statusLabel = 'You may qualify';
        updated.statusLabelHi = 'आप पात्र हो सकते हैं';
      } else {
        updated.status = 'ineligible';
        updated.statusLabel = 'Doesn’t match published criteria';
        updated.statusLabelHi = 'प्रकाशित पात्रता मानदंडों से मेल नहीं खाता';
      }
    } else if (scheme.id === 'ayushman-bharat') {
      if (currentIncome <= 20000) {
        updated.status = 'eligible';
        updated.statusLabel = 'You may qualify';
        updated.statusLabelHi = 'आप पात्र हो सकते हैं';
      } else {
        updated.status = 'need_info';
        updated.statusLabel = 'More information needed';
        updated.statusLabelHi = 'अधिक जानकारी की आवश्यकता है';
      }
    }
    
    return updated;
  });
}
