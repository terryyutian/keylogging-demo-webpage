import React from "react";
import { useNavigate } from "react-router-dom";

export default function VocabularyIntro() {
  const navigate = useNavigate();

  const startTest = () => {
    navigate("/vocab-test"); // this will be the page for the 80 trials
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, lineHeight: 1.6 }}>
      <h1 style={{ textAlign: "center" }}>Welcome to the Vocabulary Test</h1>

      <p>
        This test consists of <strong>80 trials</strong>, in each of which you will
        see a string of letters. Your task is to decide whether this is an
        existing English word or not.
      </p>

      <p>
        If you think it <strong>is</strong> an existing English word, click{" "}
        <strong>"yes"</strong>, and if you think it is <strong>not</strong> an
        existing English word, click <strong>"no"</strong>.
      </p>

      <p>
        If you are <strong>sure</strong> that the word exists, even though you
        don’t know its exact meaning, you may still respond “yes”. But if you
        are <strong>not sure</strong> if it is an existing word, you should
        respond “no”.
      </p>

      <p>
        You have <strong>as much time as you like</strong> for each decision.
        This part of the experiment will take about 6 minutes.
      </p>

      <p style={{ color: "red", marginTop: 20 }}>
        <strong>Caution:</strong> Once you get started, please do not go back to
        this instruction page or refresh the active page, otherwise you will
        start the writing task again.
      </p>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={startTest} style={{ padding: "10px 20px", fontSize: 18 }}>
          Start Test
        </button>
      </div>
    </div>
  );
}
