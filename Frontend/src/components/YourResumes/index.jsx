import React, { useState } from "react"
import "./index.css"

const BACKEND_URL = "https://resume-analyzer-backend-zico.onrender.com"

const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError("")
  }

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a resume to upload.")
      return
    }

    if (!jobDescription.trim()) {
      setError("Please paste a Job Description.")
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      setError("You must be logged in.")
      return
    }

    const formData = new FormData()
    formData.append("resume", selectedFile)

    try {
      setLoading(true)
      setError("")

      // STEP 1: Upload Resume
      const uploadResponse = await fetch(`${BACKEND_URL}/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text()
        throw new Error(text || "Resume upload failed")
      }

      const data = await uploadResponse.json()

      // STEP 2: Analyze Resume with REAL Job Description
      const rawData = {
        resumeText: data.text,
        jobDescription,
      }

      const analyzeResponse = await fetch(`${BACKEND_URL}/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rawData),
      })

      if (!analyzeResponse.ok) {
        const text = await analyzeResponse.text()
        throw new Error(text || "Resume analysis failed")
      }

      const analyzeData = await analyzeResponse.json()
      setAnalysisResult(analyzeData)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resume-container">
      <h2>Upload Your Resume</h2>

      {/* Job Description Input */}
      <textarea
        placeholder="Paste Job Description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={6}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input type="file" accept=".pdf" onChange={handleFileChange} />

      <button onClick={handleUploadAndAnalyze} disabled={loading}>
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {analysisResult && (
        <button onClick={() => setShowModal(true)}>View Report</button>
      )}

      {showModal && analysisResult && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>ATS Resume Analysis Report</h2>

            {(() => {
              const report =
                analysisResult.suggestions?.analysis ||
                analysisResult.suggestions ||
                analysisResult

              return (
                <>
                  <p>
                    <strong>Compatibility Score:</strong>{" "}
                    {report?.compatibility_score ?? analysisResult.score ?? "N/A"}%
                  </p>

                  <h3>Resume Skills</h3>
                  <ul>
                    {report?.resume_skills?.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>

                  <h3>Job Description Skills</h3>
                  <ul>
                    {report?.job_description_skills?.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>

                  <h3>Missing Skills</h3>
                  <ul>
                    {report?.missing_skills?.from_resume_for_job_description?.map(
                      (skill, i) => (
                        <li key={i}>{skill}</li>
                      )
                    )}
                  </ul>

                  <h3>Extra Skills</h3>
                  <ul>
                    {report?.missing_skills?.from_job_description_for_resume?.map(
                      (skill, i) => (
                        <li key={i}>{skill}</li>
                      )
                    )}
                  </ul>

                  <h3>ATS Optimization Tips</h3>
                  <ul>
                    {report?.ats_optimization_tips?.map((tip, i) => (
                      <li key={i}>{tip.replace(/\*\*/g, "")}</li>
                    ))}
                  </ul>

                  <h3>Bullet Improvements</h3>
                  {report?.ats_optimized_bullet_point_improvements?.map(
                    (item, i) => (
                      <div key={i}>
                        <p>
                          <strong>Original:</strong> {item.original_summary}
                        </p>
                        <p>
                          <strong>Reasoning:</strong> {item.reasoning}
                        </p>

                        <ul>
                          {item.suggested_bullets?.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}

                  <h3>Overall Assessment</h3>
                  <p>{report?.overall_assessment}</p>

                  <button onClick={() => setShowModal(false)}>Close</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default YourResumes