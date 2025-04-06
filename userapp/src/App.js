import React, { useState } from "react";

const API_URL = "https://emotional-ofelia-nivya-f673d23e.koyeb.app/recommend"; // Replace with your real Koyeb URL

function App() {
  const [formData, setFormData] = useState({
    job_title: "",
    level: "Entry",
    use_case: "Hiring",
    key_skills: "",
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      key_skills: formData.key_skills.split(",").map((skill) => skill.trim()),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("API call failed:", err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <h2>SHL Assessment Recommender</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="job_title">Job Title:</label>
          <br />
          <input
            type="text"
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="level">Job Level:</label>
          <br />
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="use_case">Use Case:</label>
          <br />
          <select
            id="use_case"
            name="use_case"
            value={formData.use_case}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="Hiring">Hiring</option>
            <option value="Development">Development</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="key_skills">Key Skills (comma-separated):</label>
          <br />
          <input
            type="text"
            id="key_skills"
            name="key_skills"
            value={formData.key_skills}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            width: "100%",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Recommendations:</h3>
      {recommendations.length === 0 && !loading && <p>No results yet.</p>}
      {recommendations.length > 0 && (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {recommendations.map((rec, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <strong>{rec.name}</strong> ({rec.category}) — {rec.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;