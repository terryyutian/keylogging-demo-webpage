import { useEffect } from "react";
import { ActivityDetector } from "./ActivityDetector";

export function useFlexKeyLogger({
  textAreaRef,
  submitButtonRef,
}) {
  useEffect(() => {
    const textarea = textAreaRef.current;
    const submitBtn = submitButtonRef.current;

    if (!textarea) return; // nothing to attach yet

    let TextareaTouch = false;
    const taskonset = Date.now();
    let EventID = 0;

    let startSelect = [];
    let endSelect = [];
    let ActivityCancel = [];
    let TextChangeCancel = [];

    let keylog = {
      TaskOnSet: [],
      TaskEnd: [],
      EventID: [],
      EventTime: [],
      Output: [],
      CursorPosition: [],
      TextContent: [],
      TextChange: [],
      Activity: [],
      FinalProduct: [],
    };

    // ----------------------
    // Stable HANDLER DEFINITIONS
    // ----------------------

    const handleCursor = () => {
      keylog.CursorPosition.push(textarea.selectionEnd);
      startSelect.push(textarea.selectionStart);
      endSelect.push(textarea.selectionEnd);
    };

    const logCurrentText = (value) => {
      keylog.TextContent.push(value);
    };

    const handleKeyDown = (e) => {
      const now = Date.now();
      keylog.EventTime.push(now - taskonset);
      EventID++;
      keylog.EventID.push(EventID);

      if (e.key === " ") keylog.Output.push("Space");
      else if (e.key === "Unidentified") keylog.Output.push("VirtualKeyboardTouch");
      else keylog.Output.push(e.key);

      logCurrentText(e.target.value);
      handleCursor();

      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );
    };

    const handleTouchStart = () => {
      TextareaTouch = true;
    };

    const handleMouseDown = (e) => {
      const now = Date.now();
      keylog.EventTime.push(now - taskonset);

      EventID++;
      keylog.EventID.push(EventID);

      if (e.button === 0) {
        keylog.Output.push(TextareaTouch ? "TextareaTouch" : "Leftclick");
      } else if (e.button === 1) {
        keylog.Output.push(TextareaTouch ? "TextareaTouch" : "Middleclick");
      } else if (e.button === 2) {
        keylog.Output.push(TextareaTouch ? "TextareaTouch" : "Rightclick");
      } else {
        keylog.Output.push(TextareaTouch ? "TextareaTouch" : "Unknownclick");
      }

      logCurrentText(e.target.value);
      handleCursor();

      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );

      TextareaTouch = false;
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      if (EventID === 0) {
        keylog = {
          EventID: [0],
          EventTime: [0],
          Output: ["NA"],
          CursorPosition: [0],
          TextContent: [0],
          TextChange: ["NoChange"],
          Activity: ["Nonproduction"],
          FinalProduct: ["The author wrote nothing."],
        };
      } else {
        keylog.TaskOnSet.push(taskonset);

        keylog.TextContent.push(String(textarea.value));
        keylog.FinalProduct = String(keylog.TextContent.slice(-1));

        handleCursor();

        ActivityDetector(
          keylog,
          startSelect,
          endSelect,
          ActivityCancel,
          TextChangeCancel
        );

        keylog.TextChange.shift();
        keylog.Activity.shift();
        keylog.CursorPosition.shift();

        keylog.TaskEnd.push(Date.now());
      }
    };


    // ------------------------
    // Attach listeners (stable references)
    // ------------------------

    textarea.addEventListener("keydown", handleKeyDown);
    textarea.addEventListener("touchstart", handleTouchStart);
    textarea.addEventListener("mousedown", handleMouseDown);

    if (submitBtn) submitBtn.addEventListener("click", handleSubmit);

    // ------------------------
    // Cleanup (removes exactly the same handlers)
    // ------------------------
    return () => {
      textarea.removeEventListener("keydown", handleKeyDown);
      textarea.removeEventListener("touchstart", handleTouchStart);
      textarea.removeEventListener("mousedown", handleMouseDown);

      if (submitBtn) submitBtn.removeEventListener("click", handleSubmit);
    };
  }, []); // run once only
}
