// import dotenv from "dotenv";
// dotenv.config();

// export const analyzeWithGemini = async (resumeText, jobDescription) => {
//   try {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error("GEMINI_API_KEY is undefined");
//     }

//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-goog-api-key": process.env.GEMINI_API_KEY
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: buildPrompt(resumeText, jobDescription)
//                 }
//               ]
//             }
//           ],
//           generationConfig: {
//             temperature: 0.2
//           }
//         })
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Gemini API Error:", data);
//       throw new Error(JSON.stringify(data));
//     }

//     const rawText =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     console.log("====== GEMINI RAW OUTPUT ======");
//     console.log(rawText);
//     console.log("================================");

//     if (!rawText) {
//       throw new Error("Empty Gemini response");
//     }

//     // Try parsing
//     try {
//       const parsed = JSON.parse(
//         rawText
//           .replace(/```json/g, "")
//           .replace(/```/g, "")
//           .trim()
//       );

//       return parsed;

//     } catch (parseError) {
//       console.warn("JSON parsing failed. Returning raw model output.");
//       return {
//         success: false,
//         raw_model_output: rawText
//       };
//     }

//   } catch (err) {
//     console.error("Gemini Fatal Error:", err.message);
//     return {
//       success: false,
//       error: err.message
//     };
//   }
// };


// const buildPrompt = (resumeText, jobDescription) => `
// You are an ATS resume analyzer.

// Return STRICT JSON only.
// Do not wrap in markdown.
// Do not include backticks.
// Do not include explanations.

// Use this exact schema:

// {
//   "success": true,
//   "analysis": {
//     "resume_skills": [],
//     "job_description_skills": [],
//     "missing_skills": {
//       "from_resume_for_job_description": [],
//       "from_job_description_for_resume": []
//     },
//     "ats_optimized_bullet_point_improvements": [
//       {
//         "original_summary": "",
//         "suggested_bullets": [],
//         "reasoning": ""
//       }
//     ],
//     "ats_optimization_tips": [],
//     "compatibility_score": 0,
//     "overall_assessment": ""
//   }
// }

// Resume:
// ${resumeText}

// Job Description:
// ${jobDescription}
// `;


import Resume from "../models/Resume.js";
import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGemini } from "../utils/aiAnalyzer.js";

/* =========================
   UPLOAD + PARSE RESUME
   ========================= */

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert Buffer → Uint8Array
    const uint8Array = new Uint8Array(req.file.buffer);

    // Parse PDF
    const text = await parseResume(uint8Array);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text extracted from PDF" });
    }

    console.log("Resume parsed. Length:", text.length);

    res.json({
      success: true,
      preview: text.substring(0, 500),
      text,
    });
  } catch (err) {
    console.error("Upload Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   ANALYZE RESUME + JD
   ========================= */

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Missing resumeText or jobDescription" });
    }

    // Keyword extraction
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);

    // ATS Score
    const score = calculateATSScore(jdKeywords, resumeKeywords);

    console.log("ATS Score:", score);

    // Gemini AI analysis
    const geminiResponse = await analyzeWithGemini(resumeText, jobDescription);

    // If Gemini failed
    if (!geminiResponse.success) {
      return res.json({
        success: false,
        score,
        error: "Gemini analysis failed",
        raw_output:
          geminiResponse.raw_model_output || geminiResponse.error || "",
      });
    }

    // Flatten response for frontend
    res.json({
      success: true,
      score,
      ...geminiResponse.analysis,
    });
  } catch (err) {
    console.error("Analyze Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};