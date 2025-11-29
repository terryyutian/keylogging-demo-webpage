import React, { useEffect, useState } from "react";
import { VOCAB_ITEMS } from "../data/vocabItems";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function VocabularyTest() {
  const navigate = useNavigate();

  const participant_id = sessionStorage.getItem("participant_id");
  const session_id = sessionStorage.getItem("session_id");

  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [startTime, setStartTime] = useState(null); // timestamp when item loads
  const [saving, setSaving] = useState(false);

  // Shuffle items on load
  useEffect(() => {
    const shuffled = [...VOCAB_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  // When item changes, record start time
  useEffect(() => {
    if (items.length > 0 && index < items.length) {
      setStartTime(performance.now());
    }
  }, [items, index]);

  const handleResponse = async (response) => {
    if (saving) return;

    const item = items[index];
    const rt_ms = Math.round(performance.now() - startTime);

    const correct =
      (response === "yes" && item.true_word === 1) ||
      (response === "no" && item.true_word === 0);

    setSaving(true);

    await supabase.from("vocab_results").insert([
      {
        participant_id,
        session_id,
        item_id: item.id,
        stimulus: item.stimulus,
        true_word: item.true_word === 1,
        response,
        correct,
        rt_ms
      }
    ]);

    setSaving(false);

    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else {
      navigate("/writing"); // go to your writing task page
    }
  };

  if (items.length === 0) return <div>Loading...</div>;

  const current = items[index];

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, textAlign: "center" }}>
      <h2>Vocabulary Test</h2>
      <p>Trial {index + 1} / 80</p>

      <div style={{ marginTop: 80, marginBottom: 40 }}>
        <h1 style={{ fontSize: 48 }}>{current.stimulus}</h1>
      </div>

      <p style={{ fontSize: 20, marginBottom: 20 }}>
        Is this string an English word?
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
        <button
          onClick={() => handleResponse("yes")}
          style={{
            padding: "12px 30px",
            fontSize: 24,
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          YES
        </button>

        <button
          onClick={() => handleResponse("no")}
          style={{
            padding: "12px 30px",
            fontSize: 24,
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          NO
        </button>
      </div>
    </div>
  );
}
