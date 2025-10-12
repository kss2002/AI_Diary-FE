import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Brain,
  BookOpen,
  MessageSquare,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import "../styles/DiaryTest.css";

const DiaryTest = () => {
  const [diaryContent, setDiaryContent] = useState("");
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const todayKey = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "{}");
    const todayEntry = entries[todayKey];
    if (todayEntry && todayEntry.content) {
      setDiaryContent(todayEntry.content);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!diaryContent.trim()) {
      alert("오늘 작성된 일기가 없습니다!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        post_id: 1,
        content: `${diaryContent}\n\n오늘 하루를 한 문장으로 표현하면: "${comment}"`,
      };

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("AI 분석 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diary-test-container">
      <div className="diary-test-bg">
        <div className="diary-test-card">
          <h2 className="title">
            <Brain size={26} className="icon" /> 오늘의 일기 감정 분석
          </h2>
          <p className="subtitle">
            오늘 작성한 일기와 한 문장 코멘트를 바탕으로 AI가 감정 리포트를 제공합니다.
          </p>

          <h4 className="section-title">
            <BookOpen size={18} className="icon" /> 오늘의 일기
          </h4>
          <textarea value={diaryContent} readOnly rows={8} />

          <h4 className="section-title">
            <MessageSquare size={18} className="icon" /> 오늘 하루를 한 문장으로 표현한다면?
          </h4>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="예: 정신없지만 뿌듯한 하루였다"
          />

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={16} /> 분석 중...
              </>
            ) : (
              <>
                <Sparkles size={16} /> AI 분석하기
              </>
            )}
          </button>

          {result && (
            <div className="analysis-result">
              <h3>
                <FileText size={20} className="icon" /> 분석 결과
              </h3>
              <p>
                <strong>감정 라벨:</strong> {result.label}
              </p>
              <p>
                <strong>감정 점수:</strong> {result.score}
              </p>
              <p>
                <strong>요약:</strong> {result.summary}
              </p>
              <p>
                <strong>공감 문장:</strong> {result.empathy}
              </p>

              {result?.recommendations?.actions?.length > 0 && (
                <>
                  <h4>💡 추천 행동</h4>
                  <ul>
                    {result.recommendations.actions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryTest;
