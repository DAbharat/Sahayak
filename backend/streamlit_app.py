"""
GovScheme Navigator (Sahayak) — Streamlit Web Application
Multilingual, voice-enabled government scheme assistance application
designed for daily wage earners, street vendors, and underserved citizens.
Written in friendly, accessible Hinglish.
"""
from __future__ import annotations

import base64
import json
import os
import streamlit as st

# Configure page layout and branding
st.set_page_config(
    page_title="GovScheme Navigator | Sahayak",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded",
)

from app.config import get_settings
from app.services.navigator_service import get_navigator_service, BudgetExceededError
from app.schemas.profile import GenderEnum, LanguageEnum, OccupationEnum, UserProfile
from app.schemas.eligibility import EligibilityStatus
from app.schemas.draft import DraftType

# ── Custom CSS for Premium Design ─────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* Main theme tokens */
    :root {
        --primary-saffron: #FF9933;
        --gov-blue: #0A2540;
        --accent-green: #138808;
        --surface-card: #FFFFFF;
        --bg-subtle: #F7FAFC;
        --border-subtle: #E2E8F0;
        --text-primary: #1A202C;
        --text-muted: #718096;
    }

    /* Header styling */
    .app-header {
        background: linear-gradient(135deg, #0A2540 0%, #1A365D 60%, #2A4365 100%);
        color: white;
        padding: 1.6rem 2rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .app-title {
        font-size: 1.85rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        color: #FFFFFF;
    }
    .app-tagline {
        font-size: 0.95rem;
        color: #E2E8F0;
        margin-top: 4px;
        margin-bottom: 0;
    }

    /* Badge tags */
    .badge {
        display: inline-block;
        padding: 0.25rem 0.65rem;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .badge-eligible {
        background-color: #DEF7EC;
        color: #03543F;
        border: 1px solid #84E1BC;
    }
    .badge-not-eligible {
        background-color: #FDE8E8;
        color: #9B1C1C;
        border: 1px solid #F8B4B4;
    }
    .badge-needs-info {
        background-color: #FEF08A;
        color: #713F12;
        border: 1px solid #FDE047;
    }
    .badge-demo {
        background-color: #FFEDD5;
        color: #9A3412;
        border: 1px solid #FDBA74;
    }

    /* Scheme card */
    .scheme-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .scheme-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }

    /* Stat box */
    .stat-card {
        background: white;
        border-left: 4px solid #FF9933;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        margin-bottom: 0.75rem;
    }
    .stat-label {
        font-size: 0.8rem;
        color: #718096;
        text-transform: uppercase;
        font-weight: 600;
    }
    .stat-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0A2540;
    }

    /* Disclaimer box */
    .disclaimer-box {
        background-color: #FFFBEB;
        border: 1px solid #FCD34D;
        border-radius: 8px;
        padding: 0.85rem 1.1rem;
        color: #92400E;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown(
    """
    <div class="app-header">
        <div>
            <h1 class="app-title">🏛️ GovScheme Navigator · Sahayak</h1>
            <p class="app-tagline">
                Multilingual Jan Kalyan Yojana Sahayak · Voice & AI-Enabled Citizen Eligibility Navigator
            </p>
        </div>
        <div style="text-align: right;">
            <span class="badge badge-demo">Demo / Hackathon MVP</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ── Initialize Services and Session State ─────────────────────────────────────
nav_service = get_navigator_service()
settings = get_settings()

if "profile" not in st.session_state:
    st.session_state["profile"] = None

if "evaluation_results" not in st.session_state:
    st.session_state["evaluation_results"] = None

if "last_transcription" not in st.session_state:
    st.session_state["last_transcription"] = ""

# ── Sidebar Controls ──────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### ⚙️ Settings & Controls")

    # Mode Selector
    mode_choice = st.radio(
        "🛠️ Operation Mode",
        options=["Mock Mode (Offline / Free)", "Live AWS (Bedrock / Polly / etc.)"],
        index=0,
        help="Mock Mode allows offline, deterministic testing at zero cost. Live AWS calls Bedrock Claude 3 Haiku, Polly, Transcribe, and Textract.",
    )
    is_mock_mode = mode_choice.startswith("Mock")

    if is_mock_mode:
        st.success("🟢 **Mock Mode Active** — 100% Offline & Free", icon="✅")
    else:
        st.warning("🟠 **Live AWS Active** — Uses AWS Bedrock & Services", icon="⚠️")

    # Preferred Language
    selected_language = st.selectbox(
        "🌐 Output Language (Bhasha)",
        options=["hinglish", "hi", "en"],
        format_func=lambda x: {
            "hinglish": "Hinglish (हिंग्लिश)",
            "hi": "Hindi (हिन्दी)",
            "en": "English",
        }[x],
        index=0,
    )

    st.markdown("---")

    # Budget & Cost Monitor
    st.markdown("### 💳 AI Budget Monitor (Cost Safety)")
    budget_info = nav_service.get_budget_status()
    used = budget_info["requests_used"]
    limit = budget_info["requests_limit"]
    st.progress(min(1.0, used / max(1, limit)))
    st.caption(f"Bedrock API calls used: **{used} / {limit}** per session")

    if st.button("🔄 Session Budget Reset Karein", use_container_width=True):
        nav_service.reset_session_budget()
        st.rerun()

    st.markdown("---")

    # AWS Architecture Status
    st.markdown("### ☁️ AWS Service Architecture")
    st.markdown(
        f"""
        - **Bedrock LLM:** `{settings.bedrock_model_id.split('.')[1] if '.' in settings.bedrock_model_id else 'Claude 3 Haiku'}`
        - **Polly Voice:** `{settings.polly_voice_id}` (Hindi Standard)
        - **Transcribe:** `hi-IN` Hindi Audio Pipeline
        - **Textract:** OCR & Key-Value Extraction
        - **AWS Region:** `{settings.aws_region}`
        """
    )

    st.markdown("---")
    st.caption(
        "🔒 **Privacy Notice (Gopniyata):**\n"
        "Ye application user ki personally identifiable information (PII) ko kisi database me permanently save nahi karta."
    )

# ── Main Tabs (Hinglish Labels) ──────────────────────────────────────────────
tab_profile, tab_eligibility, tab_explanation, tab_voice, tab_drafts, tab_documents = st.tabs([
    "📋 1. Profile Extraction",
    "✅ 2. Scheme Eligibility (Patrata)",
    "💬 3. Saral Vyakhya (Explanation)",
    "🎤 4. Awaz Sahayak (Voice)",
    "📝 5. Aavedan & Shikayat (Drafts)",
    "📄 6. Dastavej Jaanch (OCR)",
])

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 1: PROFILE EXTRACTION
# ═══════════════════════════════════════════════════════════════════════════════
with tab_profile:
    st.markdown("### 📋 Natural Language se Profile Extraction")
    st.markdown(
        "Daily wage earners, street vendors ya workers apni situation saral **Hindi, Hinglish ya English** me likh sakte hain. "
        "AI bina kisi fake facts ke sirf actual details ko structured format me extract karta hai."
    )

    # Demo Presets
    st.markdown("**Quick Testing ke liye Presets:**")
    col_p1, col_p2, col_p3 = st.columns(3)
    preset_text = ""
    if col_p1.button("🍎 Street Vendor (Delhi)"):
        preset_text = "Mera naam Ramesh hai. Main Delhi ke Karol Bagh me fruit aur sabzi ka thela lagata hu. Meri monthly income lagbhag 8000 rupaye hai, family me 4 log hain. Mere paas Aadhaar card aur Jan Dhan bank account hai."
    if col_p2.button("🔨 Construction Mazdoor (UP)"):
        preset_text = "Mera naam Suresh Yadav hai, Varanasi UP me construction mistri ka kaam karta hu. Monthly income 12000 rupaye hai. Umar 38 saal hai. Labour card aur Aadhaar card available hai."
    if col_p3.button("🌾 Chhota Kisan (Bihar)"):
        preset_text = "Main Patna Bihar se Ramu hu, 2 acre zameen me kheti karta hu. Monthly income 6000 rupees hai. Umar 45 years. Aadhaar aur bank account hai par kisan credit card abhi nahi bana hai."

    user_input_text = st.text_area(
        "Apni sthiti ka vivaran yahan likhein (Describe situation):",
        value=preset_text or st.session_state["last_transcription"] or "",
        height=130,
        placeholder="Example: Main Delhi me thela lagata hu, monthly income 8000 rupaye hai aur Aadhaar card hai...",
    )

    col_btn, col_clear = st.columns([1, 4])
    with col_btn:
        extract_btn = st.button("🔍 Profile Nikalein (Extract)", type="primary", use_container_width=True)

    if extract_btn and user_input_text.strip():
        with st.spinner("Profile extract ho rahi hai (Extracting structured profile)..."):
            try:
                profile = nav_service.extract_profile(user_input_text, mock_mode=is_mock_mode)
                st.session_state["profile"] = profile
                # Auto-evaluate schemes
                st.session_state["evaluation_results"] = nav_service.check_eligibility(profile)
                st.success("✅ Profile successfully extract ho gayi!")
            except BudgetExceededError as e:
                st.error(str(e))
            except Exception as e:
                st.error(f"Extraction me error: {str(e)}")

    # Display Extracted Profile
    current_profile = st.session_state.get("profile")
    if current_profile:
        st.markdown("---")
        st.markdown("#### 👤 Extracted Structured Profile Details")

        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Vyavasay (Occupation)</div>
                    <div class="stat-value">{current_profile.occupation.value.replace('_', ' ').title()}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with c2:
            income_display = f"₹{current_profile.monthly_income:,.0f}" if current_profile.monthly_income else "Unknown (N/A)"
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Monthly Income (Aay)</div>
                    <div class="stat-value">{income_display}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with c3:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">State / District (Location)</div>
                    <div class="stat-value">{current_profile.state or 'N/A'}, {current_profile.district or ''}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with c4:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Bank Account (Khata)</div>
                    <div class="stat-value">{'✅ Haan (Yes)' if current_profile.has_bank_account else '❌ Nahi (No)'}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        col_left, col_right = st.columns(2)
        with col_left:
            st.markdown(f"**Umar (Age):** {current_profile.age or 'Unknown (Not specified)'}")
            st.markdown(f"**Gender (Ling):** {current_profile.gender.value if current_profile.gender else 'N/A'}")
            st.markdown(f"**Available Documents (Kagazat):** {', '.join(current_profile.documents_available) if current_profile.documents_available else 'None'}")

        with col_right:
            if current_profile.missing_fields:
                st.warning(f"⚠️ **Missing Information (Adhoori Jankari):** {', '.join(current_profile.missing_fields)}")
            else:
                st.success("✅ Sabhi zaroori basic details available hain.")

        with st.expander("🔍 Raw JSON Data Dekhein (View Raw JSON)"):
            st.json(current_profile.model_dump())

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 2: ELIGIBILITY CHECK (RULES ENGINE)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_eligibility:
    st.markdown("### ✅ Sarkari Yojana Eligibility Evaluation (Rules Engine)")
    st.markdown(
        """
        <div class="disclaimer-box">
            <b>Zaroori Suraksha Niyam:</b> Scheme eligibility ka final decision kisi AI/LLM dwara nahi, balki <b>Rules Engine</b> ke coded rules se tay hota hai. AI ko rules override karne ki permission nahi hai.
        </div>
        """,
        unsafe_allow_html=True,
    )

    current_profile = st.session_state.get("profile")
    if not current_profile:
        st.info("💡 Kripya pehle **Tab 1 (Profile)** me details enter karein ya preset button dabayein.")
    else:
        results = st.session_state.get("evaluation_results")
        if not results:
            results = nav_service.check_eligibility(current_profile)
            st.session_state["evaluation_results"] = results

        # Summary Counts
        eligible_count = sum(1 for r in results if r.status == EligibilityStatus.eligible)
        not_eligible_count = sum(1 for r in results if r.status == EligibilityStatus.not_eligible)
        needs_info_count = sum(1 for r in results if r.status == EligibilityStatus.needs_more_information)

        sc1, sc2, sc3 = st.columns(3)
        sc1.metric("🟢 Eligible Schemes (Patra)", eligible_count)
        sc2.metric("🟡 Needs More Info (Aur Jankari Chahiye)", needs_info_count)
        sc3.metric("🔴 Not Eligible (Apatra)", not_eligible_count)

        st.markdown("---")

        for r in results:
            scheme = nav_service.get_scheme_by_id(r.scheme_id)

            badge_class = {
                EligibilityStatus.eligible: "badge-eligible",
                EligibilityStatus.not_eligible: "badge-not-eligible",
                EligibilityStatus.needs_more_information: "badge-needs-info",
            }.get(r.status, "badge-demo")

            status_text = {
                EligibilityStatus.eligible: "Eligible (Patra)",
                EligibilityStatus.not_eligible: "Not Eligible (Apatra)",
                EligibilityStatus.needs_more_information: "Needs More Info (Aur Jankari Chahiye)",
            }.get(r.status, r.status.value)

            with st.container():
                st.markdown(
                    f"""
                    <div class="scheme-card">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h4 style="margin: 0; color: #0A2540;">{r.scheme_name_en} <span style="font-weight: 400; color: #718096; font-size: 0.95rem;">({r.scheme_name_hi})</span></h4>
                                <p style="margin: 4px 0 8px 0; color: #4A5568; font-size: 0.88rem;">{scheme.description_en if scheme else ''}</p>
                            </div>
                            <div>
                                <span class="badge {badge_class}">{status_text}</span>
                            </div>
                        </div>
                    """,
                    unsafe_allow_html=True,
                )

                # Show breakdown
                with st.expander(f"📋 Rules Details & Verified Source ({r.scheme_name_en})"):
                    if r.matched_rules:
                        st.markdown("**Pass Huye Rules:**")
                        for m in r.matched_rules:
                            st.markdown(f"- ✅ `{m.field}`: {m.description or m.operator}")

                    if r.failed_rules:
                        st.markdown("**Fail Huye Rules:**")
                        for f in r.failed_rules:
                            st.markdown(f"- ❌ `{f.field}` (Expected: {f.expected_value}, Actual: {f.actual_value}): {f.description or ''}")

                    if r.missing_information:
                        st.markdown(f"**Required Extra Information:** {', '.join(r.missing_information)}")

                    st.markdown(f"**Required Documents (Kagazat):** {', '.join(r.required_documents)}")

                    if scheme and scheme.source:
                        st.markdown(
                            f"🌐 **Verified Sarkari Source:** [{scheme.source.title}]({scheme.source.url}) *(Verification Date: {scheme.source.version_or_checked_date})*"
                        )
                        st.caption("⚠️ Data Label: DEMO / SAMPLE DATA — Kripya official portal par final confirmation karein.")

                st.markdown("</div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 3: EXPLANATION GENERATION
# ═══════════════════════════════════════════════════════════════════════════════
with tab_explanation:
    st.markdown("### 💬 Saral & Aasan Vyakhya (Simple AI Explanation)")
    st.markdown("Ye feature citizen ko simple, non-technical bhasha me batata hai ki wo eligible kyu hain ya kya documentation bacha hai.")

    current_profile = st.session_state.get("profile")
    results = st.session_state.get("evaluation_results")

    if not current_profile or not results:
        st.info("💡 Kripya pehle **Tab 1** me profile enter karein.")
    else:
        scheme_options = {r.scheme_id: f"{r.scheme_name_en} ({r.scheme_name_hi}) - [{r.status.value}]" for r in results}
        selected_scheme_id = st.selectbox(
            "Jis scheme ki explanation chahiye, use chunein (Select Scheme):",
            options=list(scheme_options.keys()),
            format_func=lambda x: scheme_options[x],
        )

        selected_eval_result = next(r for r in results if r.scheme_id == selected_scheme_id)
        selected_scheme_record = nav_service.get_scheme_by_id(selected_scheme_id)

        if st.button("✨ Vyakhya Generate Karein (Generate Explanation)", type="primary"):
            with st.spinner("Saral vyakhya prepare ho rahi hai..."):
                try:
                    explanation_text = nav_service.explain_result(
                        profile=current_profile,
                        scheme=selected_scheme_record,
                        result=selected_eval_result,
                        language=selected_language,
                        mock_mode=is_mock_mode,
                    )
                    st.session_state[f"expl_{selected_scheme_id}"] = explanation_text
                except BudgetExceededError as e:
                    st.error(str(e))
                except Exception as e:
                    st.error(f"Error: {str(e)}")

        current_explanation = st.session_state.get(f"expl_{selected_scheme_id}")
        if current_explanation:
            st.markdown("---")
            st.markdown("#### 📢 AI dwara Saral Vyakhya:")
            st.info(current_explanation)

            # Polly Text-to-Speech playback
            if st.button("🔊 Bolkar Sunayein (Listen via Polly Audio)"):
                with st.spinner("Audio prepare ho raha hai (Amazon Polly)..."):
                    try:
                        tts_res = nav_service.synthesize_speech(
                            text=current_explanation[:500],
                            language=selected_language,
                            mock_mode=is_mock_mode,
                        )
                        if tts_res.audio_base64:
                            audio_bytes = base64.b64decode(tts_res.audio_base64)
                            st.audio(audio_bytes, format="audio/mp3")
                            st.success(f"Voice: {tts_res.voice_id}")
                    except Exception as e:
                        st.error(f"Audio playback error: {str(e)}")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 4: VOICE ASSISTANT (TRANSCRIBE & POLLY)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_voice:
    st.markdown("### 🎤 Awaz Sahayak (Voice-to-Text via Amazon Transcribe)")
    st.markdown("Jo citizens likhna nahi jaante, wo apni baat bolkar record kar sakte hain ya audio file upload kar sakte hain.")

    audio_file = st.file_uploader(
        "Audio file upload karein (WAV, MP3, M4A - Max 10 MB):",
        type=["wav", "mp3", "m4a", "ogg"],
    )

    col_v1, col_v2 = st.columns([1, 1])
    with col_v1:
        if st.button("🎙️ Demo Audio Sample Se Chalayein"):
            dummy_sample = b"\x00\x01\x02\x03" * 200
            with st.spinner("Audio transcribe ho raha hai (Amazon Transcribe)..."):
                trans_res = nav_service.transcribe_audio(dummy_sample, "demo_voice.wav", mock_mode=is_mock_mode)
                st.session_state["last_transcription"] = trans_res.transcript
                st.success(f"✅ Transcription complete! (Confidence: {trans_res.confidence or 0.95:.0%})")

    if audio_file is not None:
        file_bytes = audio_file.read()
        st.audio(file_bytes, format=audio_file.type)
        if st.button("🚀 Upload kiye gaye audio ko transcribe karein (Transcribe)"):
            with st.spinner("Amazon Transcribe audio ko process kar raha hai..."):
                try:
                    trans_res = nav_service.transcribe_audio(file_bytes, audio_file.name, mock_mode=is_mock_mode)
                    st.session_state["last_transcription"] = trans_res.transcript
                    st.success("✅ Transcription complete ho gaya!")
                except Exception as e:
                    st.error(f"Transcription error: {str(e)}")

    if st.session_state["last_transcription"]:
        st.markdown("---")
        st.markdown("#### 📝 Transcribed Text (Prapt Vivaran):")
        st.write(f"> *\"{st.session_state['last_transcription']}\"*")

        if st.button("➡️ Ye details Profile Tab me bhejein (Send to Profile Tab)"):
            st.session_state["profile"] = nav_service.extract_profile(
                st.session_state["last_transcription"], mock_mode=is_mock_mode
            )
            st.session_state["evaluation_results"] = nav_service.check_eligibility(st.session_state["profile"])
            st.success("✅ Profile extract ho gayi! Ab 'Tab 1' ya 'Tab 2' dekhein.")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 5: DRAFT GENERATOR
# ═══════════════════════════════════════════════════════════════════════════════
with tab_drafts:
    st.markdown("### 📝 Aavedan & Shikayat Patra Format (Draft Generator)")
    st.markdown("Government office, bank ya CSC center me jama karne ke liye formal application ya grievance letter ka format taiyar karein.")

    c_d1, c_d2 = st.columns(2)
    with c_d1:
        draft_type_selection = st.radio(
            "Document Format Type:",
            options=["application", "grievance"],
            format_func=lambda x: "📄 Scheme Aavedan Patra (Formal Application)" if x == "application" else "⚠️ Shikayat Nivaran Patra (Grievance Letter)",
        )
    with c_d2:
        draft_scheme_choice = st.selectbox(
            "Sambandhit Scheme (Agar pata ho):",
            options=["PM SVANidhi", "PM Jan Dhan Yojana", "PMAY-Urban", "PM Vishwakarma", "MGNREGA", "Other / General"],
        )

    draft_input_text = st.text_area(
        "Apni problem ya aavedan ka reason likhein (Reason/Issue):",
        value="Maine 3 mahine pehle apply kiya tha, lekin abhi tak bank se loan ya scheme approval nahi mila hai.",
        height=100,
    )

    if st.button("📑 Draft Letter Taiyar Karein (Generate Draft Letter)", type="primary"):
        with st.spinner("Letter draft taiyar kiya ja raha hai..."):
            try:
                prof = st.session_state.get("profile")
                prof_dict = prof.model_dump() if prof else None
                draft_res = nav_service.generate_draft(
                    user_text=draft_input_text,
                    draft_type=draft_type_selection,
                    language=selected_language,
                    scheme_name=draft_scheme_choice,
                    profile_context=prof_dict,
                    mock_mode=is_mock_mode,
                )
                st.session_state["current_draft"] = draft_res
            except BudgetExceededError as e:
                st.error(str(e))
            except Exception as e:
                st.error(f"Draft generation error: {str(e)}")

    cur_draft = st.session_state.get("current_draft")
    if cur_draft:
        st.markdown("---")
        st.markdown(
            f"""
            <div class="disclaimer-box">
                <b>Dhyan dein:</b> {cur_draft.disclaimer}
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown(f"**Subject (Vishay):** {cur_draft.subject}")
        st.markdown(f"**Required Placeholders (Submit karne se pehle ye bharein):** `{', '.join(cur_draft.placeholders)}`")

        draft_editable = st.text_area("Draft Letter (Editable):", value=cur_draft.body, height=350)

        st.download_button(
            label="💾 Letter Download Karein (Download Text)",
            data=f"{cur_draft.subject}\n\n{draft_editable}",
            file_name=f"govscheme_{cur_draft.draft_type.value}_draft.txt",
            mime="text/plain",
        )

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 6: DOCUMENT VERIFICATION / OCR
# ═══════════════════════════════════════════════════════════════════════════════
with tab_documents:
    st.markdown("### 📄 Dastavej Pathan & OCR Check (Amazon Textract)")
    st.markdown(
        """
        <div class="disclaimer-box">
            <b>⚠️ Authenticity Disclaimer:</b> Ye module sirf document ki <b>padhne yogya sthiti (Legibility & Text Reading)</b> check karta hai. 
            Ye kisi government authority dwara document ki <b>asliyat (Authenticity)</b> verify <u>nahi</u> karta.
        </div>
        """,
        unsafe_allow_html=True,
    )

    doc_file = st.file_uploader("Document photo ya PDF upload karein (Max 5 MB):", type=["png", "jpg", "jpeg", "pdf"])

    col_ocr1, col_ocr2 = st.columns(2)
    with col_ocr1:
        check_name = st.text_input("Verification ke liye Name (Expected Name):", value="RAMESH KUMAR")
    with col_ocr2:
        check_id = st.text_input("Verification ke liye ID Number (Expected ID):", value="XXXX-XXXX-4291")

    if doc_file is not None or st.button("🧪 Demo Document Se Test Karein"):
        with st.spinner("Amazon Textract se fields extract ho rahi hain..."):
            file_data = doc_file.read() if doc_file else b"%PDF-1.4 dummy document bytes"
            filename = doc_file.name if doc_file else "sample_aadhaar.pdf"
            expected = {}
            if check_name.strip():
                expected["Name"] = check_name.strip()
            if check_id.strip():
                expected["ID Number"] = check_id.strip()

            try:
                doc_res = nav_service.extract_document(file_data, filename, expected_fields=expected, mock_mode=is_mock_mode)

                st.markdown("---")
                st.markdown("#### 📊 Extracted Fields (Prapt Jankari):")

                df_rows = []
                for kv in doc_res.key_value_pairs:
                    df_rows.append({
                        "Field Name (Key)": kv.key,
                        "Extracted Value (Maan)": kv.value,
                        "Confidence (Sateekta)": f"{kv.confidence * 100:.1f}%" if kv.confidence else "N/A",
                    })
                st.table(df_rows)

                if doc_res.field_checks:
                    st.markdown("#### 🔍 Legibility Comparison (Field Checks):")
                    for fc in doc_res.field_checks:
                        if fc.legibility_match:
                            st.success(f"✅ **{fc.field_name}:** Extracted '{fc.extracted_value}' expected '{fc.expected_value}' se match karta hai.")
                        else:
                            st.warning(f"⚠️ **{fc.field_name}:** Match nahi hua (Expected: '{fc.expected_value}', Extracted: '{fc.extracted_value}')")

                with st.expander("📄 Pura Extracted Text (Raw Text)"):
                    st.text(doc_res.raw_text)

            except Exception as e:
                st.error(f"Document reading me error: {str(e)}")
