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
          <strong>영어 작문: 에세이 쓰기</strong>
        </p>
        <p>
    주의사항
    1. 에세이를 쓰는 동안 온라인 사전이나 번역기와 같은 다른 웹사이트 사용 금지
    2. 에세이 작성을 완전히 끝낸 후 “Done” 버튼 누르기 
    3. “Done”을 누른 후에 화면에 나타난 “Download as CSV,” “Download as IDFX,” “Download Final Text”를 모두 클릭하여 컴퓨터에 각  파일을 저장 후, 3개 파일 모두 청람사이버에 업로드 하기
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
