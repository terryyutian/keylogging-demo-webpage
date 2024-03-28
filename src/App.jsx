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
          This example webpage is used to demonstrate FlexKeyLogger, a web-based
          keystroke logging program for research and development purposes.
          FlexKeyLogger is written in JavaScript and runs in the background to
          collect keystroke information from the text area on the page. Please
          note that the functionality of FlexKeyLogger is confined to the text
          area. Any keystroke activities outside the text area will not activate
          the program and thus will not be recorded.
        </p>

        <p>
          You can record your keystroke information by entering text in the text
          area on the right. When you finish, click on the <i>Done</i> button.
          Then you can download your keystroke information as a CSV file or an
          IDFX file. Note that the IDFX file can be analzyed using{" "}
          <a href="https://www.inputlog.net/">Inputlog9</a>.
        </p>
      </div>

      <div className="main-area">
        {" "}
        {/* Right side */}
        <textarea
          ref={textAreaRef}
          className="text-area"
          placeholder="Enter your text here"
        ></textarea>
        <div className="buttons-container">
          <div className="download-buttons">
            <button
              ref={submitButtonRef}
              onClick={handleButtonClick}
              style={{ visibility: isSubmitClicked ? "hidden" : "visible" }}
            >
              Done
            </button>
          </div>
          <div className="download-buttons">
            <button
              style={{ visibility: isSubmitClicked ? "visible" : "hidden" }}
              className="download-button"
              ref={downloadcsvRef}
            >
              Download as CSV
            </button>
            <button
              style={{ visibility: isSubmitClicked ? "visible" : "hidden" }}
              className="download-button"
              ref={downloadidfxRef}
            >
              Download as IDFX
            </button>
            <button
              style={{ visibility: isSubmitClicked ? "visible" : "hidden" }}
              className="download-button"
              ref={downloadtextRef}
            >
              Download Final Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleApp;
