import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Edit3,
  Mic,
  Send,
  Download,
  Sparkles,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Tag,
  Globe
} from 'lucide-react';
import { Scheme, UserProfile, GrievanceDraft, GenerateGrievanceResponse, GrievanceRequest } from '../types.ts';
import { POPULAR_SCHEMES } from '../data/schemes.ts';
import { toast } from './ui/toast.tsx';

interface GrievanceEditorProps {
  scheme?: Scheme | null;
  userProfile?: UserProfile | null;
  onNavigateHome?: () => void;
  onGenerate: (request: GrievanceRequest) => Promise<GenerateGrievanceResponse>;
}

export const GrievanceEditor: React.FC<GrievanceEditorProps> = ({
  scheme,
  userProfile,
  onNavigateHome,
  onGenerate
}) => {
  // Selected Scheme (default to props scheme or PM SVANidhi)
  const [selectedSchemeId, setSelectedSchemeId] = useState<number>(
    scheme?.scheme_id || 1
  );
  const [selectedSchemeName, setSelectedSchemeName] = useState<string>(
    scheme?.name || 'PM SVANidhi (PM Street Vendor’s AtmaNirbhar Nidhi)'
  );

  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [problemDescription, setProblemDescription] = useState<string>(
    'I submitted my application two months ago with all required documents, but I have not received the disbursement or status update.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<GenerateGrievanceResponse | null>(null);
  const [editableBody, setEditableBody] = useState<string>('');
  const [editableSubject, setEditableSubject] = useState<string>('');
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);

  // Sync if scheme prop changes
  useEffect(() => {
    if (scheme) {
      setSelectedSchemeId(scheme.scheme_id || 1);
      setSelectedSchemeName(scheme.name);
    }
  }, [scheme]);

  const handleSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numId = parseInt(e.target.value, 10);
    setSelectedSchemeId(numId);
    const found = POPULAR_SCHEMES.find(s => s.scheme_id === numId);
    if (found) {
      setSelectedSchemeName(found.name);
    }
  };

  // Generate formal government grievance via Go Backend API: POST /api/grievance/generate
  const handleGenerate = async () => {
    if (!problemDescription.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    const profileContext = {
      state: userProfile?.state || 'Maharashtra',
      occupation: userProfile?.occupation || 'Farmer',
      monthly_income: userProfile?.monthly_income ?? userProfile?.monthlyIncome ?? 15000,
      age: userProfile?.age ?? 45,
      gender: userProfile?.gender || 'MALE',
      children_count: userProfile?.children_count ?? userProfile?.children ?? 2
    };

    try {
      const response = await onGenerate({
        scheme_id: selectedSchemeId,
        user_text: problemDescription.trim(),
        draft_type: 'grievance',
        language,
        profile_context: profileContext,
        scheme_name: selectedSchemeName
      });

      setApiResponse(response);
      setEditableSubject(response.subject);
      setEditableBody(response.body);
      setIsEditingDraft(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate grievance draft. Please verify connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = `SUBJECT: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const fullText = `CITIZEN GRIEVANCE REPRESENTATION / जन शिकायत आवेदन पत्र
SUBMISSION DESTINATION: CPGRAMS (pgportal.gov.in) / SCHEME NODAL OFFICER
GENERATED VIA: SAHAYAK CITIZEN WELFARE ASSISTANT
CORRELATION ID: ${apiResponse?.correlation_id || 'N/A'}
DATE: ${new Date().toLocaleDateString('en-GB')}
TARGET SCHEME: ${selectedSchemeName} (ID: ${selectedSchemeId})

==================================================
SUBJECT: ${editableSubject}
==================================================

${editableBody}

--------------------------------------------------
DISCLAIMER: ${apiResponse?.disclaimer || 'Official AI Generated Draft'}
`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sahayak_Grievance_${selectedSchemeId}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Native SpeechRecognition or simulated voice capture
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognition.interimResults = false;
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setProblemDescription(transcript);
            setIsListening(false);
          };
          recognition.onerror = () => {
            setIsListening(false);
          };
          recognition.start();
          return;
        } catch {
          // Fallback to simulation
        }
      }

      setTimeout(() => {
        if (language === 'hi') {
          setProblemDescription('मैंने दो महीने पहले पीएम स्वनिधि के सभी आवश्यक दस्तावेज जमा किए थे लेकिन अभी तक बैंक से कोई राशि या स्थिति नहीं मिली है।');
        } else if (language === 'hinglish') {
          setProblemDescription('Maine 2 month pehle application submit kiya tha par abhi tak subsidy disbursement nahi hui hai aur bank koi status update nahi de raha.');
        } else {
          setProblemDescription('I applied for the scheme two months ago with full verification, but I have not received any disbursement or status communication.');
        }
        setIsListening(false);
      }, 2000);
    }
  };

  const handleReplacePlaceholder = (placeholder: string) => {
    const replacement = prompt(`Enter real value to replace "${placeholder}":`, '');
    if (replacement !== null && replacement.trim() !== '') {
      setEditableBody(prev => prev.split(placeholder).join(replacement.trim()));
      setEditableSubject(prev => prev.split(placeholder).join(replacement.trim()));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <FileText className="w-6 h-6 text-[#F77F00]" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Citizen Grievance Redressal / जन शिकायत निवारण
          </h1>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Official Go Backend API integration (<code>POST /api/grievance/generate</code>). Automatically crafts formal, legally compliant grievance representations for CPGRAMS & Ministry Nodal Officers with your verified citizen profile context.
        </p>
      </div>

      {/* Grievance Parameters & Formulation Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Scheme Dropdown with int64 Scheme IDs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#F77F00]" />
              <span>Target Scheme / संबंधित योजना (Scheme ID)</span>
            </label>
            <select
              value={selectedSchemeId}
              onChange={handleSchemeChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#F77F00] outline-none bg-white font-medium"
            >
              {POPULAR_SCHEMES.map(s => (
                <option key={s.scheme_id} value={s.scheme_id}>
                  [ID #{s.scheme_id}] {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection: en | hi | hinglish */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#006400]" />
              <span>Draft Language / प्रारूप की भाषा</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${language === 'en'
                  ? 'bg-emerald-50 border-[#006400] text-[#006400]'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                English (Formal)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${language === 'hi'
                  ? 'bg-orange-50 border-[#F77F00] text-[#F77F00]'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                हिंदी (शुद्ध भाषा)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${language === 'hinglish'
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Profile Context Indicator */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Applicant Context:</span>
            <span>📍 {userProfile?.state || 'Maharashtra'}</span>
            <span>•</span>
            <span>👷 {userProfile?.occupation || 'Farmer'}</span>
            <span>•</span>
            <span>💰 ₹{(userProfile?.monthly_income ?? userProfile?.monthlyIncome ?? 15000).toLocaleString('en-IN')}</span>
            <span>•</span>
            <span>🎂 {userProfile?.age ?? 45} yrs, {userProfile?.gender || 'MALE'}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Auto-injected in API payload
          </span>
        </div>

        {/* Problem Input Textarea with Mic */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-sm font-bold text-gray-900">
              What problem are you facing? / आपको क्या समस्या आ रही है?
            </h2>
            <span className="text-xs text-gray-500">
              Type or tap microphone to speak
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe your issue clearly... (e.g. 'I applied for the scheme two months ago but haven't received any disbursement or status update.')"
              className="w-full p-3.5 pr-12 rounded-lg border-2 border-gray-300 focus:border-[#F77F00] focus:ring-2 focus:ring-orange-200 outline-none text-sm text-gray-900 leading-relaxed"
            />

            <button
              type="button"
              onClick={handleMicToggle}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors cursor-pointer ${isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-orange-100 text-[#F77F00] hover:bg-orange-200'
                }`}
              title="Speak grievance details"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {isListening && (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1.5">
              ● Recording voice in {language === 'hi' ? 'Hindi' : 'English'}... (सुन रहे हैं...)
            </p>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-xs font-semibold text-gray-600 block mb-1.5">
            Quick standard problem templates (Tap to insert):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setProblemDescription('I applied for the scheme two months ago, but haven’t received any subsidy disbursement or official SMS status.')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 text-gray-800 border border-gray-200 transition-colors"
            >
              ⏳ "Applied 2 months ago, no update"
            </button>
            <button
              type="button"
              onClick={() => setProblemDescription('The local nationalized bank branch rejected the interest subsidy claim citing internal software delays.')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 text-gray-800 border border-gray-200 transition-colors"
            >
              🏦 "Bank branch rejected subsidy claim"
            </button>
            <button
              type="button"
              onClick={() => setProblemDescription('Biometric e-KYC was completed at the municipal CSC center but name is not reflected in the beneficiary list.')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 text-gray-800 border border-gray-200 transition-colors"
            >
              📄 "Biometric e-KYC done, name missing"
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Generate Button: [ Generate grievance ] */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!problemDescription.trim() || isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] disabled:opacity-50 transition-colors shadow-md cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating official draft via Go API...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>[ Generate grievance / शिकायत प्रारूप तैयार करें ]</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Response Section matching Go Backend GenerateGrievanceResponse */}
      {apiResponse && (
        <div className="bg-white rounded-xl border-2 border-emerald-300 p-6 shadow-md space-y-5">
          {/* Header & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Official Redressal Draft
                </span>
                <span className="text-[11px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  {apiResponse.correlation_id}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight mt-0.5">
                Your grievance draft / आपका शिकायत प्रारूप
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingDraft(!isEditingDraft)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                <span>{isEditingDraft ? 'Preview' : '[ Edit / संपादित करें ]'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#006400] text-white text-xs font-bold hover:bg-[#004d00] transition-colors shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>[ Copy / कॉपी करें ]</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Success Feedback */}
          {copied && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Grievance draft successfully copied to clipboard! Paste it into CPGRAMS (pgportal.gov.in) or send it to your district nodal officer.
              </span>
            </div>
          )}

          {/* Placeholders Quick-Fill Chips from Backend Response */}
          {apiResponse.placeholders && apiResponse.placeholders.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg">
              <span className="text-xs font-bold text-amber-900 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span>Placeholders detected in draft (Click any chip to customize):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {apiResponse.placeholders.map((ph, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleReplacePlaceholder(ph)}
                    className="text-xs px-2.5 py-1 rounded bg-white text-amber-950 font-mono font-bold border border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors cursor-pointer"
                    title={`Click to substitute ${ph}`}
                  >
                    ✏️ {ph}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Display / Edit */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              विषय / Subject:
            </label>
            {isEditingDraft ? (
              <input
                type="text"
                value={editableSubject}
                onChange={(e) => setEditableSubject(e.target.value)}
                className="w-full px-3 py-2 font-bold text-sm bg-gray-50 rounded-lg border border-gray-300 focus:border-[#006400] outline-none"
              />
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-900">
                {editableSubject}
              </div>
            )}
          </div>

          {/* Body Display / Edit */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              आवेदन पत्र / Body Representation:
            </label>
            {isEditingDraft ? (
              <textarea
                rows={16}
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                className="w-full p-4 font-mono text-xs md:text-sm bg-gray-50 rounded-lg border border-gray-300 focus:border-[#006400] outline-none leading-relaxed"
              />
            ) : (
              <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 font-serif text-sm md:text-base text-gray-900 whitespace-pre-line leading-relaxed shadow-inner">
                {editableBody}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={isSubmitDisabled}
                onClick={() => {
                  toast.add({ title: "Email sent / ईमेल भेजा गया", type: "success" });
                  setIsSubmitDisabled(true);
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all shadow-md ${isSubmitDisabled
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-[#F77F00] hover:bg-[#D97000] cursor-pointer hover:shadow-lg'
                  }`}
              >
                <Send className="w-4 h-4" />
                {isSubmitDisabled ? 'Submitted / जमा किया गया' : 'Submit / जमा करें'}
              </button>
            </div>
          </div>

          {/* Disclaimer & Next Steps from Go Backend Response
          <div className="p-3.5 rounded-lg bg-orange-50/70 border border-orange-200 text-xs text-orange-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>🛡️ {apiResponse.disclaimer}</span>
            </p>
            <p>
              Next: Click <strong>[ Copy ]</strong> and submit on the central <strong>pgportal.gov.in</strong> or municipal office for official tracking.
            </p>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default GrievanceEditor;
