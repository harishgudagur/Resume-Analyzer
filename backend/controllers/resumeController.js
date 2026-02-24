// import Resume from "../models/Resume.js";
// import { parseResume } from "../utils/resumeParser.js";
// import { extractKeywords } from "../utils/keywordExtractor.js";
// import { calculateATSScore } from "../utils/atsScore.js";
// import { analyzeWithGemini } from "../utils/aiAnalyzer.js";

// /* =========================
//    UPLOAD + PARSE RESUME
//    ========================= */

// export const uploadResume = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // ✅ CRITICAL FIX → Convert Buffer → Uint8Array
//     const uint8Array = new Uint8Array(req.file.buffer);

//     // ✅ Parse PDF
//     const text = await parseResume(uint8Array);

//     if (!text || text.trim().length === 0) {
//       return res.status(400).json({ error: "No text extracted from PDF" });
//     }

//     console.log("Resume parsed. Length:", text.length);

//     res.json({
//       success: true,
//       preview: text.substring(0, 500),
//       text
//     });

//   } catch (err) {
//     console.error("Upload Resume Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /* =========================
//    ANALYZE RESUME + JD
//    ========================= */

// export const analyzeResume = async (req, res) => {
//   try {
//     const { resumeText, jobDescription } = req.body;

//     if (!resumeText || !jobDescription) {
//       return res.status(400).json({ error: "Missing resumeText or jobDescription" });
//     }

//     // ✅ Keyword extraction
//     const jdKeywords = extractKeywords(jobDescription);
//     const resumeKeywords = extractKeywords(resumeText);

//     // ✅ ATS Score
//     const score = calculateATSScore(jdKeywords, resumeKeywords);

//     console.log("ATS Score:", score);

//     // ✅ Gemini AI analysis
//     const suggestions = await analyzeWithGemini(resumeText, jobDescription);

//     res.json({
//       success: true,
//       score,
//       suggestions
//     });

//   } catch (err) {
//     console.error("Analyze Resume Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are an ATS resume analyzer.

Compare this Resume and Job Description.

Return ONLY valid JSON in this exact format:

{
  "compatibility_score": number,
  "resume_skills": [],
  "job_description_skills": [],
  "missing_skills": {
    "from_resume_for_job_description": [],
    "from_job_description_for_resume": []
  },
  "ats_optimization_tips": [],
  "ats_optimized_bullet_point_improvements": [
    {
      "original_summary": "",
      "reasoning": "",
      "suggested_bullets": []
    }
  ],
  "overall_assessment": ""
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON safely
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  const jsonString = text.substring(jsonStart, jsonEnd);

  return JSON.parse(jsonString);
};