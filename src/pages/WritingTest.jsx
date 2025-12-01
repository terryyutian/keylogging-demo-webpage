// src/pages/WritingTest.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useFlexKeyLogger } from "../FlexKeyLogger";

import "../styles/AppTheme.css";
import "../styles/WritingTest.css";

export default function WritingTest() {
  const navigate = useNavigate();

  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const taskStartedAt = useRef(new Date());

  // ================================
  // PROMPTS
  // ================================
  const PROMPTS = [
    {
      id: 1,
      text: `Seeking Multiple Opinions: When people ask for advice, they sometimes talk to more than one person. Explain why seeking multiple opinions can help someone make a better choice. Use specific details and examples in your response.`,
    },
    {
      id: 2,
      text: `Phones and Driving: Today the majority of humans own and operate cell phones on a daily basis. In essay form, explain if drivers should or should not be able to use cell phones in any capacity while operating a vehicle.`,
    },
  ];

  // ================================
  // STATE
  // ================================
  const [prompt, setPrompt] = useState(null);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // ================================
  // LOAD PROMPT
  // ================================
  useEffect(() => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
  }, []);

  // ================================
  // WORD COUNT
  // ================================
  useEffect(() => {
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [text]);

  // ================================
  // TIMER
  // ================================
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ================================
  // PAGE LEAVE WARNING
  // ================================
  useEffect(() => {
    const handler = () => {
      if (document.hidden) alert("Please stay focused on the writing task.");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // ================================
  // KEYLOGGER (MUST RUN OUTSIDE EFFECT)
  // ================================
  useFlexKeyLogger({
    textAreaRef,
    submitButtonRef,
  });

  // Autofocus when ready
  useEffect(() => {
    if (textAreaRef.current) textAreaRef.current.focus();
  }, [prompt]);

  // ================================
  // SUBMIT HANDLER
  // ================================
  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your essay?")) return;

    const participant_id = sessionStorage.getItem("participant_id");
    const session_id = sessionStorage.getItem("session_id");

    // Save writing text
    const { data: writingRows, error: writingErr } = await supabase
      .from("writing_texts")
      .insert([
        {
          participant_id,
          session_id,
          prompt_id: prompt.id,
          prompt_text: prompt.text,
          text,
          word_count: wordCount,
          paragraph_count: text.split(/\n\s*\n/).length,
          task_onset: taskStartedAt.current,
          task_end: new Date(),
        },
      ])
      .select()
      .single();

    if (writingErr) {
      alert("Error saving your writing.");
      return;
    }

    const writing_id = writingRows.id;

    // ================================
    // RETRIEVE KEYLOG OBJECT
    // ================================
    const keylog = textAreaRef.current?._keylog ?? null;

    if (!keylog || !keylog.EventID || keylog.EventID.length === 0) {
      alert("No keystroke data detected.");
      navigate("/finish");
      return;
    }

    // Convert keylogger output to DB rows
    const rows = keylog.EventID.map((_, i) => ({
      participant_id,
      session_id,
      writing_id,
      event_id: keylog.EventID[i],
      event_time: keylog.EventTime[i],
      output: keylog.Output[i],
      cursor_position: keylog.CursorPosition[i],
      text_change: keylog.TextChange[i],
      activity: keylog.Activity[i],
    }));

    // Insert keystrokes to DB
    const { error: logErr } = await supabase
      .from("keystroke_logs")
      .insert(rows);

    if (logErr) console.error(logErr);

    alert("Your essay has been submitted.");
    navigate("/finish");
  };

  // ================================
  // RENDER
  // ================================
  if (!prompt) {
    return (
      <div className="writing-layout">
        <div className="writing-main">
          <div className="timer-right">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="writing-layout">

      {/* LEFT PANEL */}
      <div className="writing-sidebar">
        <h2 className="writing-title">Writing Task</h2>

        <div className="writing-prompt-box">
          <p><strong>Prompt:</strong></p>
          <p className="prompt-text">{prompt.text}</p>
        </div>

        <h3 className="instruction-title">Instructions</h3>
        <ul className="instruction-list">
          <li>Write independently for 30 minutes.</li>
          <li>Write your own original work.</li>
          <li>Do not refresh or leave this page.</li>
          <li>Copy/paste is disabled.</li>
        </ul>
      </div>

      {/* MAIN PANEL */}
      <div className="writing-main">

        <div className="timer-right">{formatTime(timeLeft)}</div>

        <textarea
          ref={textAreaRef}
          className="writing-textarea"
          placeholder="Start writing your essay here..."
          spellCheck="false"
          value={text}
          onChange={(e) => setText(e.target.value)}

          // Disable copy/paste/cut/right-click
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) &&
                ["c", "v", "x"].includes(e.key.toLowerCase())) {
              e.preventDefault();
            }
          }}
        />

        <div className="word-count">Word Count: {wordCount}</div>

        <div className="submit-container">
          <button
            ref={submitButtonRef}
            className="submit-button"
            onClick={handleSubmit}
          >
            Submit Essay
          </button>
        </div>
      </div>
    </div>
  );
}
