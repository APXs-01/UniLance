// Member 4 - SmartQuestPage (AI Skill Validation — Gemini MCQ Quiz)
import { useState, useEffect, useRef } from "react";
import { smartQuestAPI } from "../../api/axios";

const CATEGORIES = ["Graphic Design","Full Stack Web Development","Cyber Security","Data Science","Business Analysis"];

const SmartQuestPage = () => {
  const [phase, setPhase]         = useState("select"); // select | quiz | result
  const [category, setCategory]   = useState("");
  const [quest, setQuest]         = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [result, setResult]       = useState(null);
  const [timeLeft, setTimeLeft]   = useState(30 * 60);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const timerRef = useRef(null);

  // Member 4 - 30-minute countdown timer
  useEffect(() => {
    if (phase !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Member 4 - startSmartQuestSession
  const startQuest = async () => {
    if (!category) { setError("Please select a skill category."); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await smartQuestAPI.start({ skillCategory: category, totalQuestions: 10 });
      setQuest(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setTimeLeft(30 * 60);
      setPhase("quiz");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start SmartQuest.");
    } finally { setLoading(false); }
  };

  // Member 4 - submitSmartQuestAnswers
  const handleSubmit = async (timedOut = false) => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const { data } = await smartQuestAPI.submit(quest.questId, {
        answers: answers.map((a) => (a === null ? "" : String(a))),
      });
      setResult({ ...data.result, timedOut });
      setPhase("result");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally { setLoading(false); }
  };

  if (phase === "select") return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="card">
          <div className="card-body">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <img src="/Home/Nav/AI-Powered.svg" alt="SmartQuest" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 12 }} />
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>SmartQuest</h2>
              <p style={{ color: "#6B7280", fontSize: 15, marginTop: 8 }}>
                AI-generated MCQ challenge powered by Google Gemini. Score 80%+ to earn a Verified Badge.
              </p>
            </div>

            <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {[
                  ["/Home/Time.svg","30 minutes","Timed session"],
                  ["/Home/Questions.svg","Gemini AI","Questions generated"],
                  ["/Home/Badge.svg","80% required","To earn badge"],
                  ["/Home/Attempts.svg","2 attempts","Per 24 hours"]
                ].map(([img,t,s])=>(
                  <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <img src={img} alt={t} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{s}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Select Skill Category</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding: "14px 16px", borderRadius: 10, border: `2px solid ${category===c?"#4F46E5":"#E5E7EB"}`, background: category===c?"#EEF2FF":"#fff", color: category===c?"#4F46E5":"#374151", fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all 0.2s", textAlign: "left" }}>
                    <img src={`/Home/${c}.png`} alt={c} style={{ width: 22, height: 22, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} />{c}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={startQuest} disabled={loading || !category}>
              {loading ? "Generating questions with AI..." : "Start SmartQuest →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === "quiz") return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Timer bar */}
        <div style={{ position: "sticky", top: 64, background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, zIndex: 50 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>🧠 {category}</span>
            <span style={{ color: "#6B7280", fontSize: 13, marginLeft: 12 }}>
              {answers.filter(a=>a!==null).length}/{quest.questions.length} answered
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: timeLeft < 300 ? "#EF4444" : "#4F46E5" }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => handleSubmit()} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${(answers.filter(a=>a!==null).length/quest.questions.length)*100}%` }} />
        </div>

        {/* Questions */}
        {quest.questions.map((q, qi) => (
          <div key={qi} className="card mb-2">
            <div className="card-body">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#111827" }}>
                <span style={{ color: "#4F46E5", marginRight: 8 }}>Q{qi+1}.</span>{q.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(prev => { const n=[...prev]; n[qi]=oi; return n; })}
                    style={{ padding: "12px 16px", borderRadius: 10, border: `2px solid ${answers[qi]===oi?"#4F46E5":"#E5E7EB"}`, background: answers[qi]===oi?"#EEF2FF":"#fff", color: answers[qi]===oi?"#4F46E5":"#374151", fontWeight: answers[qi]===oi?700:400, cursor: "pointer", textAlign: "left", fontSize: 14, transition: "all 0.15s" }}>
                    <span style={{ fontWeight: 700, marginRight: 10, color: "#9CA3AF" }}>{["A","B","C","D"][oi]}.</span>
                    {opt.replace(/^[ABCD]\.\s*/,"")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (phase === "result") return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card text-center">
          <div className="card-body" style={{ padding: 48 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>
              {result.passed ? "🏅" : "😔"}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: result.passed ? "#10B981" : "#EF4444" }}>
              {result.passed ? "You Passed!" : "Not Passed"}
            </h2>
            <div style={{ fontSize: 52, fontWeight: 900, color: result.passed ? "#10B981" : "#EF4444", margin: "16px 0" }}>
              {result.score}%
            </div>
            <p style={{ color: "#6B7280", marginBottom: 24 }}>
              {result.correctCount} / {result.totalQuestions} correct answers
            </p>

            {result.passed ? (
              <div style={{ background: "#D1FAE5", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅ Verified Badge Earned!</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#065F46" }}>{result.badgeTitle}</div>
                <div style={{ fontSize: 13, color: "#059669", marginTop: 8 }}>Added to your profile and portfolio PDF</div>
              </div>
            ) : (
              <div style={{ background: "#FEE2E2", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: "#991B1B" }}>Minimum required: 80%</div>
                <div style={{ fontSize: 13, color: "#DC2626", marginTop: 6 }}>{result.message}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => { setPhase("select"); setCategory(""); setQuest(null); setResult(null); }}>
                {result.passed ? "Try Another Skill" : "Try Again"}
              </button>
              <a href="/profile?tab=skills" className="btn btn-secondary">View My Profile</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartQuestPage;
