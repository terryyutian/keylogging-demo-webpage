import { useRef } from "react";
import React, { useState } from "react";
import "./App.css";
import { useFlexKeyLogger } from "./FlexKeyLogger";

const ExampleApp = () => {
  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const downloadcsvRef = useRef(null);
  const downloadidfxRef = useRef(null);
  const downloadtextRef = useRef(null);

  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const handleButtonClick = () => {
    setIsSubmitClicked(true);
  };

  useFlexKeyLogger({
    textAreaRef,
    submitButtonRef,
    downloadcsvRef,
    downloadidfxRef,
    downloadtextRef,
  });
  return (
    <div className="app-container">
      <div className="instruction-area">
        <p className="title">
          <strong>Instructions</strong>
        </p>
        <p>
          Content from Prompt 1 or 2
        </p>

        <p>
          •	Write independently for 30 minutes.
          •	Write at least 200 words.
          •	Write at least three paragraphs.
          •	Do not leave this page while writing.

        </p>
      </div>

      <div className="main-area">
        {" "}
        {/* Right side */}
        <textarea
          ref={textAreaRef}
          className="text-area"
          spellCheck="false"
          placeholder="Enter your text here"
          
        ></textarea>
        <div className="buttons-container">
          <div className="download-buttons">
            <button
              ref={submitButtonRef}
              onClick={handleButtonClick}
              style={{ visibility: isSubmitClicked ? "hidden" : "visible" }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleApp;
