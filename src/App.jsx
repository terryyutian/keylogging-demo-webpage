// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Demographics from "./pages/Demographics";
import VocabularyIntro from "./pages/VocabularyIntro";
import VocabularyTest from "./pages/VocabularyTest";
import WritingIntro from "./pages/WritingIntro";
import WritingTest from "./pages/WritingTest";
import ThankYou from "./pages/ThankYou";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Demographic Page */}
        <Route path="/demographics" element={<Demographics />} />

        {/* Vocabulary Pages */}
        <Route path="/vocab" element={<VocabularyIntro />} />
        <Route path="/vocab-test" element={<VocabularyTest />} />

        {/* Writing Pages */}
        <Route path="/writing-instructions" element={<WritingIntro />} />
        <Route path="/writing" element={<WritingTest />} />

        {/* Final Page */}
        <Route path="/finish" element={<ThankYou />} />

        {/* Default Route: go to demographics */}
        <Route path="*" element={<Demographics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
