const { getGeminiModel } = require('../config/gemini');
const ApiError = require('../utils/ApiError');

const buildPrompt = (resumeText, jobDescription) => {
  return `You are an expert ATS (Applicant Tracking System) and career coach. Analyze the resume text below${
    jobDescription ? ' against the provided job description' : ''
  } and return ONLY a valid JSON object (no markdown, no code fences, no commentary) matching exactly this schema:

{
  "atsScore": number (0-100, how well the resume is optimized for ATS parsing and keyword relevance),
  "jobMatchScore": number (0-100, how well the resume matches the job description; 0 if no job description was provided),
  "summary": string (a concise 2-4 sentence professional summary of the candidate),
  "technicalSkills": string[] (technical/hard skills found in the resume),
  "softSkills": string[] (soft skills found in the resume),
  "missingSkills": string[] (important skills missing relative to the job description or the candidate's apparent target role; empty array if not determinable),
  "suggestions": string[] (specific, actionable improvements for the resume),
  "grammarIssues": string[] (grammar, clarity, or readability issues found; empty array if none),
  "interviewQuestions": [
    {
      "question": string (a likely interview question based on this candidate's resume and target role),
      "category": string (one of: "Technical", "Behavioral", "Project-based", "Role-specific"),
      "tip": string (a short 1-2 sentence tip on how to approach answering this specific question well)
    }
  ] (generate exactly 6 realistic interview questions: a mix of technical, behavioral, and project-based questions tailored to this candidate's actual skills and experience)
}

Resume text:
"""
${resumeText}
"""
${
  jobDescription
    ? `\nJob description:\n"""\n${jobDescription}\n"""\n`
    : ''
}`;
};

const stripCodeFences = (text) => {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
};

const analyzeResume = async (resumeText, jobDescription = '') => {
  const model = getGeminiModel();
  const prompt = buildPrompt(resumeText, jobDescription);

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    throw new ApiError(502, `Gemini API request failed: ${err.message}`);
  }

  const rawText = result.response.text();
  const cleaned = stripCodeFences(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ApiError(502, 'Failed to parse AI analysis response as JSON');
  }

  const interviewQuestions = Array.isArray(parsed.interviewQuestions)
    ? parsed.interviewQuestions
        .filter((q) => q && typeof q.question === 'string')
        .map((q) => ({
          question: q.question,
          category: q.category || 'General',
          tip: q.tip || '',
        }))
    : [];

  return {
    atsScore: Number(parsed.atsScore) || 0,
    jobMatchScore: Number(parsed.jobMatchScore) || 0,
    summary: parsed.summary || '',
    technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
    softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    grammarIssues: Array.isArray(parsed.grammarIssues) ? parsed.grammarIssues : [],
    interviewQuestions,
  };
};

module.exports = { analyzeResume };