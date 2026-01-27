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

// Constraint: no more than 3 consecutive words OR nonwords (in the randomized VOCAB stream)
const MAX_RUN = 3;

// Keep attempts modest for speed; with 80 items this is still extremely fast
const MAX_ATTEMPTS = 60;

// -------------------------
// Randomization utilities
// -------------------------

// Fisher–Yates shuffle (unbiased)
function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Max consecutive run length for a binary category
function maxRunLength(items, categoryFn) {
  let maxRun = 0;
  let curRun = 0;
  let prev = undefined;

  for (const it of items) {
    const c = categoryFn(it); // e.g., 1 for word, 0 for nonword
    if (c === prev) curRun += 1;
    else {
      curRun = 1;
      prev = c;
    }
    if (curRun > maxRun) maxRun = curRun;
  }
  return maxRun;
}

/**
 * Fisher–Yates + constraint + retry.
 * - Generates a full random permutation
 * - Accepts it only if max run length <= MAX_RUN
 * - Retries up to MAX_ATTEMPTS
 *
 * Designed to be fast: only runs once on mount.
 */
function constrainedShuffle(items, categoryFn, maxRun = 3, maxAttempts = 60) {
  // Try up to maxAttempts to find a valid shuffle quickly
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = fisherYatesShuffle(items);
    if (maxRunLength(shuffled, categoryFn) <= maxRun) return shuffled;
  }

  // Best-effort fallback (rare): return the shuffle with the smallest max-run found
  let best = fisherYatesShuffle(items);
  let bestScore = maxRunLength(best, categoryFn);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = fisherYatesShuffle(items);
    const score = maxRunLength(candidate, categoryFn);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
      if (bestScore <= maxRun) break;
    }
  }
  return best;
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

  // Build constrained-randomized items on mount (replaces bucket method)
  useEffect(() => {
    const seq = constrainedShuffle(
      VOCAB_ITEMS,
      (x) => x.true_word, // 1 = word, 0 = nonword
      MAX_RUN,
      MAX_ATTEMPTS
    );
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
