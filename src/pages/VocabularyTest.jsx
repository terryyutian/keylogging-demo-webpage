import React, { useEffect, useState } from "react";
import { VOCAB_ITEMS } from "../data/vocabItems";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/AppTheme.css";

export default function VocabularyTest() {
  const navigate = useNavigate();

  const participant_id = sessionStorage.getItem("participant_id");
  const session_id = sessionStorage.getItem("session_id");

  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const shuffled = [...VOCAB_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  useEffect(() => {
    if (items.length > 0 && idx < items.length) {
      setStartTime(performance.now());
    }
  }, [items, idx]);

  const handleResponse = async (response) => {
    const item = items[idx];
    const rt_ms = Math.round(performance.now() - startTime);

    await supabase.from("vocab_results").insert([
      {
        participant_id,
        session_id,
        item_id: item.id,
        stimulus: item.stimulus,
        true_word: item.true_word === 1,
        response,
        correct:
          (response === "yes" && item.true_word === 1) ||
          (response === "no" && item.true_word === 0),
        rt_ms,
      },
    ]);

    if (idx + 1 < items.length) setIdx(idx + 1);
    else navigate("/writing-instructions");
  };

  if (items.length === 0) return <div>Loading...</div>;

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <h1 className="page-title">Vocabulary Test</h1>
        <p className="page-text">Trial {idx + 1} of 80</p>

        <div className="big-text">{items[idx].stimulus}</div>

        <p className="page-text">Is this an English word?</p>

        <div className="choice-row">
          <button
            className="choice-button yes"
            onClick={() => handleResponse("yes")}
          >
            YES
          </button>
          <button
            className="choice-button no"
            onClick={() => handleResponse("no")}
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
