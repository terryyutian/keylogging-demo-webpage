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
          <strong>한국어 작문</strong>
        </p>
        <p>
        주어진 주제에 대해서 10분간 한국어로 글을 작성해주세요. 글쓰기가 다 끝나면 [done]버튼을 클릭하고, [Download as CSV], [Download as IDFX], [Download Final Text]를 각각 클릭해서 해당 파일을 다운받아 주세요. 그리고 세 개의 파일을 모두 여기 이메일(sangheek@andrew.cmu.edu)로 보내주세요. 
        </p>
        <p>
        주제: 시간을 되돌릴 수 있다면, 어느 시점으로 돌아가고 싶나요?
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
