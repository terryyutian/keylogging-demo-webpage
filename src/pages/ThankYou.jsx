import React from "react";

export default function ThankYou() {
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        padding: 40,
        textAlign: "center",
      }}
    >
      <h1>Thank you!</h1>

      <p style={{ fontSize: 18, marginTop: 20 }}>
        Congratulations! You have completed all the tasks! You can now exit the study.
      </p>

      <a
        href="https://prolific.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 30,
          padding: "12px 24px",
          fontSize: 16,
          fontWeight: "bold",
          textDecoration: "none",
          color: "#fff",
          backgroundColor: "#4f46e5",
          borderRadius: 6,
        }}
      >
        Back to Prolific
      </a>
    </div>
  );
}
