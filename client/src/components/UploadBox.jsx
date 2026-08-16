import "./UploadBox.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadBox() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("Analyze Resume");
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            alert("Please select a PDF or DOCX file.");
            event.target.value = "";
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleAnalyze = async (event) => {
        event.preventDefault();

        if (!file) {
            alert("Please select a resume first!");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please log in first to analyze your resume.");
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            setStatusText("Uploading...");

            const formData = new FormData();
            formData.append("resume", file);

            const uploadResponse = await fetch(
                "http://localhost:5000/api/resume/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || "Upload failed");
            }

            const resumeId = uploadData.data.resume.id;

            setStatusText("Analyzing with AI...");

            const analyzeResponse = await fetch(
                "http://localhost:5000/api/analysis/analyze",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ resumeId })
                }
            );

            const analyzeData = await analyzeResponse.json();

            if (!analyzeResponse.ok) {
                throw new Error(analyzeData.message || "Analysis failed");
            }

            navigate("/result", {
                state: {
                    analysis: analyzeData.data.analysis
                }
            });

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setStatusText("Analyze Resume");
        }
    };

    return (
        <section className="upload-box">

            <h2>Upload Resume</h2>

            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
            />

            {file && (
                <p className="selected-file">
                    Selected: <strong>{file.name}</strong>
                </p>
            )}

            <button
                type="button"
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? statusText : "Analyze Resume"}
            </button>

        </section>
    );
}

export default UploadBox;
