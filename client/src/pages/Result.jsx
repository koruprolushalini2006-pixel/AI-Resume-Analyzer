import "./Result.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;

  useEffect(() => {
    if (!analysis) {
      navigate("/");
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  const {
    atsScore,
    jobMatchScore,
    summary,
    technicalSkills = [],
    softSkills = [],
    missingSkills = [],
    suggestions = [],
    grammarIssues = [],
    interviewQuestions = [],
  } = analysis;

  return (
    <div className="result-container">
      <div className="result-card">
        <h1>Resume Analysis Result</h1>

        <div className="score-box">
          <h2>ATS Score</h2>
          <h1>{atsScore}%</h1>
          {jobMatchScore > 0 && (
            <p className="job-match-score">Job Match Score: {jobMatchScore}%</p>
          )}
        </div>

        {summary && (
          <div className="section">
            <h3>📝 Summary</h3>
            <p>{summary}</p>
          </div>
        )}

        {technicalSkills.length > 0 && (
          <div className="section">
            <h3>✅ Technical Skills</h3>
            <ul>
              {technicalSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {softSkills.length > 0 && (
          <div className="section">
            <h3>🤝 Soft Skills</h3>
            <ul>
              {softSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div className="section">
            <h3>⚠ Missing Skills</h3>
            <ul>
              {missingSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="section">
            <h3>💡 AI Suggestions</h3>
            <ul>
              {suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {grammarIssues.length > 0 && (
          <div className="section">
            <h3>✍️ Grammar & Clarity Issues</h3>
            <ul>
              {grammarIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {interviewQuestions.length > 0 && (
          <div className="section">
            <h3>🎤 Likely Interview Questions</h3>
            <div className="interview-questions">
              {interviewQuestions.map((q, i) => (
                <div className="interview-question-card" key={i}>
                  <p className="question-category">{q.category}</p>
                  <p className="question-text">{q.question}</p>
                  {q.tip && <p className="question-tip">Tip: {q.tip}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/">
          <button className="back-btn">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Result;