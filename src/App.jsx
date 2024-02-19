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
          This example webpage is used to demonstrate a web-based keystroke
          logging program for research and development purposes. The keystroke
          logging program is written in JavaScript and runs in the background to
          collect keystroke information from the text area on the page. Please
          note that the functionality of this keystroke logging program is
          confined to the text area. Any keystroke activities outside the text
          area will not activate the program and thus will not be recorded.
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
          For more information about the code and data format, please visit{" "}
          <a href="https://github.com/terryyutian/keylogging-demo-webpage">
            {" "}
            this github repo
          </a>
          . If you want to implement the keystroke logging proram in your
          applications, please contact Yu Tian at{" "}
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
