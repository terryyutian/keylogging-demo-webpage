import React from "react";
import { useNavigate } from "react-router-dom";

export default function WritingIntro() {
  const navigate = useNavigate();

  const startWriting = () => {
    navigate("/writing"); // This will be your actual writing page with keylogger
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 30, lineHeight: 1.6 }}>
      <h1 style={{ textAlign: "center" }}>Writing Task Instructions</h1>

      <p>
        You will write a <strong>persuasive essay</strong> in response to a prompt
        we provide.
      </p>

      <h3>Requirements</h3>
      <ul>
        <li>Write for <strong>30 minutes</strong>.</li>
        <li>At least <strong>200 words</strong> and <strong>three paragraphs</strong>.</li>
        <li>Write independently in your own words.</li>
      </ul>

      <h3>Restrictions</h3>
      <ul>
        <li>Do <strong>not</strong> use AI tools, search engines, notes, or any external resources.</li>
        <li>Stay focused and avoid unrelated activities until you finish.</li>
      </ul>

      <p style={{ marginTop: 30 }}>
        After you click the button below, the writing task will begin.
      </p>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button
          onClick={startWriting}
          style={{
            padding: "12px 28px",
            fontSize: 20,
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Begin Writing Task
        </button>
      </div>
    </div>
  );
}
