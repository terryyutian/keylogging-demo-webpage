import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AppTheme.css";

export default function VocabularyIntro() {
  const navigate = useNavigate();

  const startTest = () => navigate("/vocab-test");

  return (
    <div className="page-wrapper">
      <div className="card">
        <h1 className="page-title">Vocabulary Test Instructions</h1>

        <p className="page-text">
          You will complete <strong>80 trials</strong> to test whether you can
          identify real English words.
        </p>

        <p className="page-text">
          On each trial, you will see a string of letters. Your task is to decide
          whether it is an <strong>existing English word</strong>.
        </p>

        <p className="page-text">
          If you believe it <strong>is</strong> a real English word, click
          <strong> YES</strong>.  
          If you believe it is <strong>not</strong> a real word, click
          <strong> NO</strong>.
        </p>

        <div className="warning-box">
          <p className="page-text" style={{ margin: 0 }}>
            Once you begin, do not refresh the page or click “Back” — the test
            will restart.
          </p>
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={startTest}>
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
