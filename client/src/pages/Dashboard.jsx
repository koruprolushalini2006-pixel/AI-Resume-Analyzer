import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>AI Resume Analyzer</h1>
        <h2>Welcome 👋</h2>

        <p>Ready to analyze your resume?</p>

        <Link to="/upload">
          <button className="upload-btn">Upload Resume</button>
        </Link>

        <div className="recent-section">
          <h3>Recent Resume Analyses</h3>

          <div className="resume-item">
            <span>Resume.pdf</span>
            <span>ATS: 85%</span>
          </div>

          <div className="resume-item">
            <span>Resume2.pdf</span>
            <span>ATS: 91%</span>
          </div>
        </div>

        <button className="logout-btn">Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;