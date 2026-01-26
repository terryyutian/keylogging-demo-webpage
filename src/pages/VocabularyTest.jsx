import React, { useEffect, useMemo, useState } from "react";
import { VOCAB_ITEMS } from "../data/vocabItems";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/AppTheme.css";

const PROLIFIC_RETURN_URL = "https://app.prolific.com/";

// Attention checks: after every 15 trials (i.e., after trials 15, 30, 45, 60)
// Order: NO, YES, NO, YES
const ATTENTION_CHECK_POSITIONS = [15, 30, 45, 60]; // 1-based trial numbers
const ATTENTION_CHECK_ORDER = ["no", "yes", "no", "yes"];

const ATTENTION_CHECK_STIMULUS = (expected) =>
  expected === "yes" ? "SELECT YES" : "SELECT NO";

const FAIL_OUT_MESSAGE =
  "You did not pass the required attention checks. Please click OK to return to Prolific and return your submission. Thank you.";

// Bucket constraint: no more than 3 consecutive words or nonwords
const MAX_RUN_BUCKET = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a sequence from two pools (words/nonwords) while enforcing maxRun <= 3.
 * Pools are lightly shuffled once; selection is random unless maxRun reached.
 * O(n) for n=80 (very fast).
 */
function buildBucketSequence(words, nonwords, maxRun = 3) {
  const w = shuffle(words);
  const n = shuffle(nonwords);

  const out = [];
  let lastPool = null; // "w" | "n" | null
  let runLen = 0;

  while (w.length > 0 || n.length > 0) {
    const wAvail = w.length > 0;
    const nAvail = n.length > 0;

    let pickPool;

    if (!wAvail) pickPool = "n";
    else if (!nAvail) pickPool = "w";
    else {
      const mustFlip = lastPool && runLen >= maxRun;
      if (mustFlip) {
        pickPool = lastPool === "w" ? "n" : "w";
      } else {
        // Randomly select which bucket to draw from (50/50).
        pickPool = Math.random() < 0.5 ? "w" : "n";
      }
    }

    const item = pickPool === "w" ? w.pop() : n.pop();
    out.push(item);

    if (pickPool === lastPool) runLen += 1;
    else {
      lastPool = pickPool;
      runLen = 1;
    }
  }

  return out;
}

export default function VocabularyTest() {
  const navigate = useNavigate();

  const participant_id = sessionStorage.getItem("participant_id");
  const session_id = sessionStorage.getItem("session_id");

  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Track attention check performance (real-time exclusion)
  const [attnWrongCount, setAttnWrongCount] = useState(0);
  const [terminated, setTerminated] = useState(false);

  // Build a map: trialNumber -> expectedResponse ("yes"/"no") for attention checks
  const attnCheckMap = useMemo(() => {
    const m = new Map();
    ATTENTION_CHECK_POSITIONS.forEach((trialNo, i) => {
      m.set(trialNo, ATTENTION_CHECK_ORDER[i]);
    });
    return m;
  }, []);

  // Build bucket-randomized items on mount (replaces biased .sort(Math.random()-0.5))
  useEffect(() => {
    const words = VOCAB_ITEMS.filter((x) => x.true_word === 1);
    const nonwords = VOCAB_ITEMS.filter((x) => x.true_word === 0);
    const seq = buildBucketSequence(words, nonwords, MAX_RUN_BUCKET);
    setItems(seq);
  }, []);

  useEffect(() => {
    if (items.length > 0 && idx < items.length) {
      setStartTime(performance.now());
    }
  }, [items, idx]);

  const endStudyAndReturnToProlific = () => {
    setTerminated(true);
    window.alert(FAIL_OUT_MESSAGE); // OK-only dialog
    window.location.assign(PROLIFIC_RETURN_URL);
  };

  const handleResponse = async (response) => {
    if (terminated) return;
    if (!startTime || items.length === 0) return;

    const trialNumber = idx + 1; // 1-based
    const isAttentionCheck = attnCheckMap.has(trialNumber);
    const expectedAttentionResponse = attnCheckMap.get(trialNumber);

    const item = items[idx];
    const rt_ms = Math.round(performance.now() - startTime);

    const attention_correct = isAttentionCheck
      ? response === expectedAttentionResponse
      : null;

    const correct = isAttentionCheck
      ? attention_correct
      : (response === "yes" && item.true_word === 1) ||
        (response === "no" && item.true_word === 0);

    // Insert trial
    const { error } = await supabase.from("vocab_results").insert([
      {
        participant_id,
        session_id,
        item_id: item.id,
        stimulus: isAttentionCheck
          ? ATTENTION_CHECK_STIMULUS(expectedAttentionResponse)
          : item.stimulus,
        true_word: isAttentionCheck ? null : item.true_word === 1,
        response,
        correct,
        rt_ms,

      },
    ]);

    // If DB insert fails, stop advancing (prevents silent data loss)
    if (error) {
      console.error("Supabase insert failed:", error);
      // You can show a friendly message if you want:
      // window.alert("A network error occurred. Please try again.");
      return;
    }

    // Update attention-check failure count
    let newWrongCount = attnWrongCount;
    if (isAttentionCheck && !attention_correct) {
      newWrongCount = attnWrongCount + 1;
      setAttnWrongCount(newWrongCount);
    }

    // Fail out if they miss 2 attention checks
    if (isAttentionCheck && !attention_correct && newWrongCount >= 2) {
      endStudyAndReturnToProlific();
      return;
    }

    if (idx + 1 < items.length) setIdx(idx + 1);
    else navigate("/writing-instructions");
  };

  if (items.length === 0) return <div>Loading...</div>;

  const trialNumber = idx + 1;
  const isAttentionCheck = attnCheckMap.has(trialNumber);
  const expected = attnCheckMap.get(trialNumber);
  const displayStimulus = isAttentionCheck
    ? ATTENTION_CHECK_STIMULUS(expected)
    : items[idx].stimulus;

  const promptText = isAttentionCheck
    ? "Attention Check: Please follow the instruction above."
    : "Is this an English word?";

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 className="page-title">Vocabulary Test</h1>
        <p className="page-text">Trial {trialNumber} of 80</p>

        <div className="big-text">{displayStimulus}</div>

        <p className="page-text">{promptText}</p>

        <div className="choice-row">
          <button
            className="choice-button yes"
            onClick={() => handleResponse("yes")}
            disabled={terminated}
          >
            YES
          </button>
          <button
            className="choice-button no"
            onClick={() => handleResponse("no")}
            disabled={terminated}
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
