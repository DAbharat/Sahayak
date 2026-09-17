"""
GovScheme Navigator — Mock AI and AWS Services Layer
Provides offline, deterministic, cost-safe mock responses for all AI & AWS tasks.
Never calls Bedrock, Transcribe, Polly, or Textract.
"""
from __future__ import annotations

import base64
import re
import uuid
from typing import Dict, List, Optional

from app.schemas.profile import (
    GenderEnum,
    LanguageEnum,
    OccupationEnum,
    UserProfile,
)
from app.schemas.eligibility import (
    EligibilityResult,
    EligibilityStatus,
)
from app.schemas.scheme import SchemeRecord
from app.schemas.draft import DraftResponse, DraftType
from app.schemas.voice import TranscribeResponse, SynthesizeResponse
from app.schemas.document import (
    DocumentExtractResponse,
    ExtractedField,
    FieldCheckResult,
)


def mock_extract_profile(text: str) -> UserProfile:
    """
    Deterministically extracts structured profile fields using pattern matching.
    Never calls external AI APIs.
    """
    text_lower = text.lower()

    # Detect Occupation
    occupation = OccupationEnum.unknown
    if any(w in text_lower for w in ["thela", "vendor", "rehri", "street vendor", "selling", "patr"]):
        occupation = OccupationEnum.street_vendor
    elif any(w in text_lower for w in ["construction", "mistri", "mazdoor", "cement", "building"]):
        occupation = OccupationEnum.construction_worker
    elif any(w in text_lower for w in ["kisan", "farmer", "agriculture", "khet", "farming"]):
        occupation = OccupationEnum.small_farmer
    elif any(w in text_lower for w in ["auto", "rickshaw", "driver"]):
        occupation = OccupationEnum.auto_driver
    elif any(w in text_lower for w in ["karigar", "artisan", "carpenter", "blacksmith", "lohar", "badhai"]):
        occupation = OccupationEnum.artisan
    elif any(w in text_lower for w in ["maid", "domestic", "cook", "cleaning"]):
        occupation = OccupationEnum.domestic_worker
    elif any(w in text_lower for w in ["daily wage", "dihaadi", "dihadi", "shramik"]):
        occupation = OccupationEnum.daily_wage_worker

    # Detect Monthly Income
    monthly_income: Optional[float] = None
    income_match = re.search(r'(?:₹|rs\.?|inr|kamata|income|rupaye|rupees)?\s*(\d{3,6})', text_lower)
    if income_match:
        val = float(income_match.group(1))
        # sensible range check
        if 1000 <= val <= 200000:
            monthly_income = val
    if monthly_income is None:
        if "8000" in text_lower or "8,000" in text_lower:
            monthly_income = 8000.0
        elif "10000" in text_lower or "10,000" in text_lower:
            monthly_income = 10000.0
        elif "12000" in text_lower or "12,000" in text_lower:
            monthly_income = 12000.0
        elif "15000" in text_lower or "15,000" in text_lower:
            monthly_income = 15000.0
        elif "5000" in text_lower or "5,000" in text_lower:
            monthly_income = 5000.0

    # Detect State & District
    state: Optional[str] = None
    district: Optional[str] = None
    state_map = {
        "delhi": ("Delhi", "New Delhi"),
        "up": ("Uttar Pradesh", "Varanasi"),
        "uttar pradesh": ("Uttar Pradesh", "Lucknow"),
        "bihar": ("Bihar", "Patna"),
        "maharashtra": ("Maharashtra", "Mumbai"),
        "mumbai": ("Maharashtra", "Mumbai"),
        "mp": ("Madhya Pradesh", "Bhopal"),
        "madhya pradesh": ("Madhya Pradesh", "Bhopal"),
        "rajasthan": ("Rajasthan", "Jaipur"),
        "bengal": ("West Bengal", "Kolkata"),
    }
    for kw, (st, dist) in state_map.items():
        if kw in text_lower:
            state = st
            district = dist
            break

    # Detect Gender
    gender: Optional[GenderEnum] = None
    if any(w in text_lower for w in ["mahila", "aurat", "female", "woman", "girl", "bahu"]):
        gender = GenderEnum.female
    elif any(w in text_lower for w in ["purush", "aadmi", "male", "man", "boy"]):
        gender = GenderEnum.male

    # Detect Age
    age: Optional[int] = None
    age_match = re.search(r'(?:age|umar|saal|years old|varsh)\s*(?:is|ke|h|hai)?\s*(\d{2})', text_lower)
    if age_match:
        age = int(age_match.group(1))
    elif any(w in text_lower for w in ["35", "30", "42", "28"]):
        for cand in [35, 30, 42, 28]:
            if str(cand) in text_lower and (monthly_income != float(cand)):
                age = cand
                break

    # Detect Bank Account
    has_bank_account: Optional[bool] = None
    if any(w in text_lower for w in ["bank account", "khata", "bank khata", "account hai"]):
        has_bank_account = True
    elif any(w in text_lower for w in ["no bank", "khata nahi", "account nahi"]):
        has_bank_account = False

    # Documents available
    docs: List[str] = []
    if any(w in text_lower for w in ["aadhaar", "aadhar"]):
        docs.append("Aadhaar Card")
    if any(w in text_lower for w in ["ration", "rashan"]):
        docs.append("Ration Card")
    if any(w in text_lower for w in ["voter", "pehchan"]):
        docs.append("Voter ID")
    if any(w in text_lower for w in ["vendor card", "lor", "vending certificate"]):
        docs.append("Vending Certificate/Letter of Recommendation")
    if any(w in text_lower for w in ["shramik card", "e-shram", "labour card"]):
        docs.append("e-Shram / Labour Card")

    # Detect Language
    language = LanguageEnum.en
    if re.search(r'[\u0900-\u097F]', text):
        language = LanguageEnum.hi
    elif any(w in text_lower for w in ["mera", "naam", "hai", "mujhe", "kripya", "chahiye", "karna", "thela"]):
        language = LanguageEnum.hinglish

    # Missing fields calculation
    missing_fields = []
    if state is None:
        missing_fields.append("state")
    if monthly_income is None:
        missing_fields.append("monthly_income")
    if occupation == OccupationEnum.unknown:
        missing_fields.append("occupation")
    if age is None:
        missing_fields.append("age")
    if has_bank_account is None:
        missing_fields.append("has_bank_account")

    confidence = {
        "occupation": 0.95 if occupation != OccupationEnum.unknown else 0.2,
        "monthly_income": 0.90 if monthly_income is not None else 0.0,
        "state": 0.92 if state else 0.0,
        "language": 0.98,
    }

    return UserProfile(
        state=state or "Delhi",
        district=district or "New Delhi",
        occupation=occupation if occupation != OccupationEnum.unknown else OccupationEnum.street_vendor,
        monthly_income=monthly_income if monthly_income is not None else 8000.0,
        age=age or 35,
        gender=gender or GenderEnum.male,
        has_bank_account=True if has_bank_account is None else has_bank_account,
        is_registered_worker=True if "shram" in text_lower or "card" in text_lower else None,
        documents_available=docs if docs else ["Aadhaar Card", "Bank Passbook"],
        missing_fields=missing_fields,
        language=language,
        confidence=confidence,
        raw_input=text,
    )


def mock_generate_explanation(
    profile: UserProfile,
    scheme: SchemeRecord,
    result: EligibilityResult,
    language: str = "hi",
) -> str:
    """
    Generates deterministic explanation text matching the rules engine output.
    """
    scheme_name = scheme.name_hi if language == "hi" else scheme.name_en

    if result.status == EligibilityStatus.eligible:
        if language == "hi":
            return (
                f"बधाई हो! आप **{scheme_name}** के लिए पूरी तरह पात्र पाए गए हैं। "
                f"आपकी दर्ज मासिक आय (₹{profile.monthly_income or 'N/A'}) और व्यवसाय "
                f"योजना के नियमों के अनुकूल है। "
                f"\n\n**आवश्यक दस्तावेज़:** " + ", ".join(scheme.required_documents) +
                f"\n\n**अगले कदम:** आप अपने नजदीकी जन सेवा केंद्र (CSC) या आधिकारिक पोर्टल ({scheme.source.url}) पर आवेदन कर सकते हैं।"
            )
        elif language == "hinglish":
            return (
                f"Congratulations! Aap **{scheme_name}** ke liye eligible hain. "
                f"Aapki monthly income (₹{profile.monthly_income or 'N/A'}) aur occupation "
                f"scheme ke criteria se match karte hain. "
                f"\n\n**Zaroori Documents:** " + ", ".join(scheme.required_documents) +
                f"\n\n**Next Steps:** Aap official portal ({scheme.source.url}) par ja kar apply kar sakte hain."
            )
        else:
            return (
                f"Congratulations! You are eligible for **{scheme.name_en}**. "
                f"Your declared monthly income (INR {profile.monthly_income or 'N/A'}) and occupation "
                f"fulfill the scheme's criteria. "
                f"\n\n**Required Documents:** " + ", ".join(scheme.required_documents) +
                f"\n\n**Next Steps:** You may proceed to apply at your nearest CSC center or official portal ({scheme.source.url})."
            )

    elif result.status == EligibilityStatus.not_eligible:
        failed_desc = [r.description or r.field for r in result.failed_rules]
        reasons_text = ", ".join(failed_desc) if failed_desc else "नियम मिलान नहीं हुआ"
        if language == "hi":
            return (
                f"वर्तमान विवरण के अनुसार, आप **{scheme_name}** के लिए पात्र नहीं हैं। "
                f"कारण: {reasons_text}। "
                f"यदि यह जानकारी अधूरी है, तो कृपया सही विवरण के साथ पुनः जांचें।"
            )
        elif language == "hinglish":
            return (
                f"Current details ke hisaab se, aap **{scheme_name}** ke liye eligible nahi hain. "
                f"Reason: {reasons_text}. "
                f"Agar details me koi galti hai toh kripya update karke dobara check karein."
            )
        else:
            return (
                f"Based on the provided information, you do not meet the criteria for **{scheme.name_en}**. "
                f"Reason: {reasons_text}. "
                f"Please update your profile details if any information was entered incorrectly."
            )

    else:  # needs_more_information
        missing = ", ".join(result.missing_information) or "अतिरिक्त विवरण"
        if language == "hi":
            return (
                f"**{scheme_name}** की पात्रता की पुष्टि के लिए कुछ और जानकारी की आवश्यकता है: {missing}। "
                f"कृपया यह विवरण दर्ज करें ताकि सही परिणाम दिया जा सके।"
            )
        elif language == "hinglish":
            return (
                f"**{scheme_name}** ki eligibility verify karne ke liye kuch aur information chahiye: {missing}. "
                f"Kripya ye information provide karein."
            )
        else:
            return (
                f"To determine your eligibility for **{scheme.name_en}**, the following additional information is required: {missing}. "
                f"Please update these fields to see your final eligibility."
            )


def mock_generate_draft(
    user_text: str,
    draft_type: DraftType | str = DraftType.application,
    language: str = "hi",
    scheme_name: Optional[str] = None,
    profile_context: Optional[dict] = None,
) -> DraftResponse:
    """
    Generates a realistic formal application or grievance letter.
    """
    dt = DraftType(draft_type) if isinstance(draft_type, str) else draft_type
    target_scheme = scheme_name or "सरकारी कल्याण योजना (Government Scheme)"

    placeholders = [
        "[APPLICANT_NAME]",
        "[FATHER_SPOUSE_NAME]",
        "[AADHAAR_NUMBER]",
        "[MOBILE_NUMBER]",
        "[RESIDENTIAL_ADDRESS]",
        "[DATE]",
    ]

    if dt == DraftType.application:
        if language == "hi":
            subject = f"विषय: {target_scheme} के अंतर्गत आवेदन हेतु प्रार्थना पत्र"
            body = (
                f"सेवा में,\n"
                f"श्रीमान नोडल अधिकारी महोदय,\n"
                f"{target_scheme} विभाग, [DISTRICT_NAME], [STATE_NAME]\n\n"
                f"महोदय,\n"
                f"सविनय निवेदन है कि मैं [APPLICANT_NAME], निवासी [RESIDENTIAL_ADDRESS] का स्थायी निवासी हूँ। "
                f"मेरी वर्तमान स्थिति: {user_text}\n\n"
                f"मैं इस योजना के सभी आवश्यक नियमों एवं शर्तों को पूरा करता/करती हूँ। "
                f"अतः आपसे सादर अनुरोध है कि मेरे आवेदन पर सहानुभूतिपूर्वक विचार करते हुए मुझे {target_scheme} "
                f"का लाभ प्रदान करने की कृपा करें।\n\n"
                f"संलग्न दस्तावेज़:\n"
                f"1. आधार कार्ड छायाप्रति\n"
                f"2. बैंक पासबुक प्रति\n"
                f"3. आय प्रमाण / स्व-घोषणा पत्र\n\n"
                f"धन्यवाद,\n\n"
                f"हस्ताक्षर / अंगूठा: _____________\n"
                f"नाम: [APPLICANT_NAME]\n"
                f"आधार संख्या: [AADHAAR_NUMBER]\n"
                f"मोबाईल: [MOBILE_NUMBER]\n"
                f"दिनांक: [DATE]"
            )
        else:
            subject = f"Subject: Application for Benefits under {target_scheme}"
            body = (
                f"To,\n"
                f"The Competent Authority,\n"
                f"{target_scheme} Directorate, [DISTRICT_NAME], [STATE_NAME]\n\n"
                f"Respected Sir/Madam,\n\n"
                f"I, [APPLICANT_NAME], residing at [RESIDENTIAL_ADDRESS], submit this formal application "
                f"for enrollment under {target_scheme}.\n\n"
                f"My declared background: {user_text}\n\n"
                f"I confirm that the facts stated herein are true to the best of my knowledge, and I meet "
                f"the prescribed criteria. I kindly request you to process my application at the earliest.\n\n"
                f"Enclosures:\n"
                f"1. Copy of Aadhaar Card\n"
                f"2. Bank Passbook details\n"
                f"3. Proof of occupation / Income self-declaration\n\n"
                f"Sincerely,\n\n"
                f"Signature: _____________\n"
                f"Name: [APPLICANT_NAME]\n"
                f"Aadhaar: [AADHAAR_NUMBER]\n"
                f"Mobile: [MOBILE_NUMBER]\n"
                f"Date: [DATE]"
            )
    else:  # grievance
        if language == "hi":
            subject = f"विषय: {target_scheme} से संबंधित समस्या/शिकायत निवारण हेतु आवेदन"
            body = (
                f"सेवा में,\n"
                f"श्रीमान जन शिकायत निवारण अधिकारी महोदय,\n"
                f"[DISTRICT_NAME], [STATE_NAME]\n\n"
                f"महोदय,\n"
                f"सविनय निवेदन है कि मैं [APPLICANT_NAME], आधार संख्या [AADHAAR_NUMBER], ने {target_scheme} "
                f"के अंतर्गत पूर्व में आवेदन किया था।\n\n"
                f"मेरी समस्या का विवरण:\n{user_text}\n\n"
                f"काफी समय व्यतीत हो जाने के उपरांत भी इस संबंध में कोई ठोस कार्रवाई नहीं हुई है। "
                f"अतः श्रीमान जी से विनम्र निवेदन है कि मामले की तत्काल जांच कराकर उचित समाधान कराने की कृपा करें।\n\n"
                f"भवदीय,\n"
                f"नाम: [APPLICANT_NAME]\n"
                f"मोबाईल: [MOBILE_NUMBER]\n"
                f"दिनांक: [DATE]"
            )
        else:
            subject = f"Subject: Grievance regarding {target_scheme} Processing Delay"
            body = (
                f"To,\n"
                f"The Public Grievance Redressal Officer,\n"
                f"[DISTRICT_NAME], [STATE_NAME]\n\n"
                f"Dear Sir/Madam,\n\n"
                f"I, [APPLICANT_NAME], submit this representation regarding an ongoing issue "
                f"under {target_scheme}.\n\n"
                f"Details of Issue:\n{user_text}\n\n"
                f"Despite following the due procedure, I have faced delays. I request your prompt intervention "
                f"to resolve this matter.\n\n"
                f"Respectfully,\n"
                f"Name: [APPLICANT_NAME]\n"
                f"Mobile: [MOBILE_NUMBER]\n"
                f"Date: [DATE]"
            )

    return DraftResponse(
        draft_type=dt,
        language=language,
        subject=subject,
        body=body,
        placeholders=placeholders,
        disclaimer=(
            "This draft was generated as a starting point. "
            "Please review and fill in all [PLACEHOLDER] fields before submitting."
        ),
        correlation_id=str(uuid.uuid4()),
    )


def mock_transcribe_audio(file_bytes: bytes, filename: str) -> TranscribeResponse:
    """
    Returns deterministic transcription without calling Amazon Transcribe or S3.
    """
    sample_transcript = (
        "मेरा नाम रमेश कुमार है। मैं दिल्ली के करोल बाग में फल और सब्जी का ठेला लगाता हूँ। "
        "मेरी मासिक आय लगभग 8000 रुपये है और मेरा परिवार 4 सदस्यों का है। "
        "मेरे पास आधार कार्ड और जनधन बैंक खाता है। मुझे प्रधानमंत्री स्वनिधि योजना का लाभ चाहिए।"
    )
    return TranscribeResponse(
        transcript=sample_transcript,
        language_code="hi-IN",
        job_name=f"mock-job-{uuid.uuid4().hex[:8]}",
        confidence=0.96,
        correlation_id=str(uuid.uuid4()),
    )


def mock_synthesize_speech(text: str, language: str = "hi") -> SynthesizeResponse:
    """
    Returns mock speech synthesis without calling Amazon Polly.
    Generates a tiny dummy base64 string and preserves full text fallback.
    """
    # 64 bytes of dummy audio data
    dummy_audio = b"\xff\xfb\x90\x44" + b"\x00" * 60
    audio_b64 = base64.b64encode(dummy_audio).decode("ascii")

    return SynthesizeResponse(
        audio_base64=audio_b64,
        content_type="audio/mpeg",
        text_fallback=text,
        voice_id="Aditi (Mock)",
        synthesis_succeeded=True,
        correlation_id=str(uuid.uuid4()),
    )


def mock_extract_document(
    file_bytes: bytes,
    filename: str,
    expected_fields: Optional[Dict[str, str]] = None,
) -> DocumentExtractResponse:
    """
    Extracts simulated key-value fields from a document without calling Amazon Textract.
    Emphasizes legibility check only — not authenticity.
    """
    key_value_pairs = [
        ExtractedField(key="Document Type", value="Aadhaar / ID Card", confidence=0.98),
        ExtractedField(key="Name", value="RAMESH KUMAR", confidence=0.96),
        ExtractedField(key="Father Name", value="SHYAM LAL", confidence=0.92),
        ExtractedField(key="DOB / Year of Birth", value="1989", confidence=0.95),
        ExtractedField(key="Gender", value="MALE", confidence=0.99),
        ExtractedField(key="Address", value="Karol Bagh, Central Delhi, Delhi - 110005", confidence=0.91),
        ExtractedField(key="ID Number", value="XXXX-XXXX-4291", confidence=0.97),
    ]

    field_checks: List[FieldCheckResult] = []
    if expected_fields:
        for exp_key, exp_val in expected_fields.items():
            # Check if any extracted pair loosely matches
            match = False
            extracted_val = None
            for kv in key_value_pairs:
                if exp_key.lower() in kv.key.lower():
                    extracted_val = kv.value
                    if exp_val.strip().lower() in kv.value.lower() or kv.value.lower() in exp_val.strip().lower():
                        match = True
                    break
            field_checks.append(
                FieldCheckResult(
                    field_name=exp_key,
                    extracted_value=extracted_val,
                    expected_value=exp_val,
                    legibility_match=match,
                    note="Text extraction check only — not an authenticity verification.",
                )
            )

    raw_text = (
        "GOVERNMENT OF INDIA\n"
        "Name: RAMESH KUMAR\n"
        "Father's Name: SHYAM LAL\n"
        "DOB: 15/08/1989\n"
        "Gender: MALE\n"
        "Address: Karol Bagh, Central Delhi, Delhi - 110005\n"
        "XXXX XXXX 4291\n"
    )

    return DocumentExtractResponse(
        raw_text=raw_text,
        key_value_pairs=key_value_pairs,
        field_checks=field_checks,
        page_count=1,
        authenticity_disclaimer=(
            "Document extraction is for legibility and field-reading only. "
            "This system does NOT verify document authenticity, government portal status, or submission."
        ),
        correlation_id=str(uuid.uuid4()),
    )
