import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useFlexKeyLogger } from "../FlexKeyLogger";

export default function WritingTest() {
  const navigate = useNavigate();

  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);

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
  const [allowSubmit, setAllowSubmit] = useState(false);

  // =====================================
  // RANDOM PROMPT
  // =====================================
  useEffect(() => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
  }, []);

  // =====================================
  // WORD COUNT
  // =====================================
  useEffect(() => {
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [text]);

  // =====================================
  // UNLOCK SUBMIT
  // =====================================
  useEffect(() => {
    const elapsed = 30 * 60 - timeLeft;
    if (wordCount >= 200 || elapsed >= 20 * 60) {
      setAllowSubmit(true);
    }
  }, [wordCount, timeLeft]);

  // =====================================
  // COUNTDOWN TIMER
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
  // TAB INACTIVITY WARNING
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
  // SUBMIT HANDLER
  // =====================================
  const handleSubmit = async () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit your essay?");
    if (!confirmSubmit) return;

    const participant_id = sessionStorage.getItem("participant_id");
    const session_id = sessionStorage.getItem("session_id");

    // 1. INSERT INTO writing_texts
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
          task_onset: new Date(Date.now() - (30 * 60 - timeLeft) * 1000),
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

    // 2. GET KEYLOG DATA FROM LOGGER
    const keylog = textAreaRef.current?._keylog ?? null;

    if (!keylog || !keylog.EventID) {
      alert("No keystroke data detected.");
      navigate("/finish");
      return;
    }

    // 3. FORMAT KEYLOG EVENTS FOR SUPABASE
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

    // 4. BATCH INSERT KEYLOGS
    const { error: logErr } = await supabase.from("keystroke_logs").insert(rows);

    if (logErr) {
      alert("Error saving keystroke logs.");
      console.error(logErr);
    }

    alert("Your essay has been submitted.");
    navigate("/finish");
  };

  if (!prompt) return <div>Loading prompt...</div>;

  // =====================================
  // UI
  // =====================================
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT SIDE */}
      <div style={{ width: "30%", padding: 20, background: "#f0f0f0" }}>
        <h2>Writing Task</h2>
        <p><strong>Prompt</strong></p>
        <p>{prompt.text}</p>

        <h3>Instructions</h3>
        <ul>
          <li>Write independently for 30 minutes.</li>
          <li>Write at least 200 words.</li>
          <li>Write at least three paragraphs.</li>
          <li>Do not leave this page while writing.</li>
        </ul>

        <p style={{ marginTop: 20 }}><strong>Time Left:</strong></p>
        <p style={{ fontSize: 24 }}>{formatTime(timeLeft)}</p>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, padding: 20 }}>
        <textarea
          ref={textAreaRef}
          placeholder="Start writing your essay here..."
          spellCheck="false"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            height: "75%",
            padding: 10,
            fontSize: 16,
          }}
        />

        <div style={{ textAlign: "right", marginTop: 10 }}>
          Word Count: {wordCount}
        </div>

        {allowSubmit && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              ref={submitButtonRef}
              onClick={handleSubmit}
              style={{
                padding: "12px 28px",
                fontSize: 20,
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 8,
              }}
            >
              Submit Essay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
