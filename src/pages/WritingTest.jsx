// src/pages/WritingTest.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useFlexKeyLogger } from "../FlexKeyLogger";
import "../styles/AppTheme.css";
import "../styles/WritingTest.css";

export default function WritingTest() {
  const navigate = useNavigate();

  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const taskStartedAt = useRef(new Date()); // Actual start timestamp

  // =====================================
  // PROMPTS
  // =====================================
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

  // =====================================
  // STATE
  // =====================================
  const [prompt, setPrompt] = useState(null);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // =====================================
  // RANDOM PROMPT
  // =====================================
  useEffect(() => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
  }, []);

  // =====================================
  // WORD COUNT (for display only)
  // =====================================
  useEffect(() => {
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [text]);

  // =====================================
  // TIMER
  // =====================================
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

  // =====================================
  // TAB WARNING
  // =====================================
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        alert("Please stay focused on the writing task.");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // =====================================
  // KEYLOGGER
  // =====================================
  useFlexKeyLogger({
    textAreaRef,
    submitButtonRef,
  });

  // =====================================
  // SUBMIT HANDLER (always available)
  // =====================================
  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your essay?")) return;

    const participant_id = sessionStorage.getItem("participant_id");
    const session_id = sessionStorage.getItem("session_id");

    // Save writing
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

    // Save keystrokes
    const keylog = textAreaRef.current?._keylog ?? null;

    if (!keylog || !keylog.EventID) {
      alert("No keystroke data detected.");
      navigate("/finish");
      return;
    }

    const rows = keylog.EventID.map((_, i) => ({
      participant_id,
      session_id,
      writing_id,
      event_id: keylog.EventID[i],
      event_time: keylog.EventTime[i],
      output: keylog.Output[i],
      cursor_position: keylog.CursorPosition[i],
      text_content: keylog.TextContent[i],
      text_change: keylog.TextChange[i],
      activity: keylog.Activity[i],
    }));

    const { error: logErr } = await supabase.from("keystroke_logs").insert(rows);
    if (logErr) console.error(logErr);

    alert("Your essay has been submitted.");
    navigate("/finish");
  };

  if (!prompt) return <div>Loading prompt...</div>;

  // =====================================
  // UI
  // =====================================
  return (
    <div className="writing-layout">

      {/* LEFT SIDE */}
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
          <li>Do not leave or refresh this page.</li>
          <li>Copy/paste is disabled to ensure fairness.</li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="writing-main">

        {/* Timer */}
        <div className="timer-right">
          <strong>Time Left:</strong> {formatTime(timeLeft)}
        </div>

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
              (e.key === "c" || e.key === "v" || e.key === "x")) {
              e.preventDefault();
            }
          }}
        />

        <div className="word-count">Word Count: {wordCount}</div>

        {/* Submit ALWAYS shown and active */}
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
