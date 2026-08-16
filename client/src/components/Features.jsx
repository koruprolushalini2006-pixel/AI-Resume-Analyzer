import "./Features.css";

function Features() {
  return (
    <section className="features">

      <h2>Features</h2>

      <div className="cards">

        <div className="card">
          <h3>ATS Score</h3>
          <p>Know how well your resume performs.</p>
        </div>

        <div className="card">
          <h3>Skill Analysis</h3>
          <p>Find missing skills required for jobs.</p>
        </div>

        <div className="card">
          <h3>AI Suggestions</h3>
          <p>Improve your resume using AI recommendations.</p>
        </div>

      </div>

    </section>
  );
}

export default Features;