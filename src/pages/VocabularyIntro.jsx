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
          You will complete <strong>80 trials</strong> in a vocabulary (lexical
          decision) task designed to assess your ability to recognize English
          words.
        </p>

        <p className="page-text">
          On each trial, you will see a string of letters. Your task is to decide
          whether the string forms a real <strong>English</strong> word.
        </p>

        <p className="page-text">
          If you believe the string <strong>is</strong> an English word, click
          <strong> YES</strong>. If you believe it is <strong>not</strong> an
          English word, click <strong> NO</strong>.
        </p>

        <p className="page-text">
          To ensure data quality, this task includes <strong>four attention-check
          trials</strong>. These trials will clearly instruct you to select
          either <strong>YES</strong> or <strong>NO</strong>.
        </p>

        <p className="page-text">
          If you respond incorrectly to <strong>two or more</strong> of the four
          attention-check trials, the study will be <strong>automatically
          ended</strong>, and you will be redirected to Prolific to return your
          submission.
        </p>

        <div className="warning-box">
          <p className="page-text" style={{ margin: 0 }}>
            Once you begin the test, do not refresh the page or click the
            browser’s “Back” button. Doing so will restart the task.
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
