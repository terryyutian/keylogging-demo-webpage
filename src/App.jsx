import { useRef } from "react";
import React, { useState } from "react";
import "./App.css";
import { useKeyStrokeLogger } from "./useKeyStrokeLogger";

const ExampleApp = () => {
  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const downloadcsvRef = useRef(null);
  const downloadtextRef = useRef(null);

  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const handleButtonClick = () => {
    setIsSubmitClicked(true);
  };

  useKeyStrokeLogger({
    textAreaRef,
    submitButtonRef,
    downloadcsvRef,
    downloadtextRef,
  });
  return (
    <div className="app-container">
      <div className="instruction-area">
        <p className="title">
          <strong>Instructions</strong>
        </p>
        <p>
          This example webpage can be used to collect and download keystroke
          logging information for research purposes. A keystroke logging program
          is developed and embedded in this web app. It runs in the background
          and stores keystroke information from the text area on the right.
          Please note that the functionality of this keystroke logging program
          is confined to the text area. Any keystroke activities outside the
          text area will not activate the program and thus will not be recorded.
        </p>

        <p>
          You can record your keystroke information by entering text in the text
          area on the right. When you finish, click on the <i>Done</i> button.
          Then you can download your keystroke information as a CSV file by
          clicking on the
          <i>Download as CSV</i> button. You can also download the final text
          you entered by clicking on the
          <i>Download Final Text</i> button.
        </p>

        <p>
          This example webpage can be customized based on your research needs.
          For instance, you can replace the instructions here with a writing
          prompt. You can also set up an API to ingest the keystroke logging
          data into a cloud-based database. For more information conerning the
          adaptation of the code and the web design, please contact Yu Tian at{" "}
          <a href="mailto:terry@levi.digitalharbor.org">
            terry@levi.digitalharbor.org
          </a>
          .
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
