import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AppTheme.css";

export default function WritingIntro() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="card">
        <h1 className="page-title">Writing Task Instructions</h1>

        <p className="page-text">
          You will write a <strong>persuasive essay</strong> in response to a
          prompt.
        </p>

        <h2 className="section-title">Requirements</h2>
        <ul className="page-text">
          <li>Write for up to <strong>20 minutes</strong>.</li>
          <li>At least <strong>200 words</strong>.</li>
          <li>At least <strong>three paragraphs</strong>.</li>
        </ul>

        <h2 className="section-title">Restrictions</h2>
        <ul className="page-text">
          <li>Do NOT use AI tools, search engines, or outside materials.</li>
          <li>Do NOT refresh or leave this page once the task begins.</li>
        </ul>

        <div className="button-row">
          <button className="primary-button" onClick={() => navigate("/writing")}>
            Begin Writing Task
          </button>
        </div>
      </div>
    </div>
  );
}
