// attachFlexKeyLogger.js
import { ActivityDetector } from "./ActivityDetector.js";

/**
 * Vanilla-JS keystroke logger attachment.
 * Collects and stores keystroke data only (no download, no export).
 *
 * @param {Object} opts
 * @param {HTMLTextAreaElement} opts.textarea
 * @param {HTMLElement|null} [opts.submitBtn]  // optional "Done" / finalize trigger
 *
 * @returns {Object} controls
 * @returns {Function} controls.detach    - remove all event listeners
 * @returns {Function} controls.getKeylog - retrieve keylog object (by reference)
 * @returns {Function} controls.finalize  - manually finalize the task
 */
export function attachFlexKeyLogger({
  textarea,
  submitBtn = null,
}) {
  if (!textarea) {
    throw new Error("attachFlexKeyLogger: textarea is required.");
  }

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
  // Helper functions
  // ----------------------

  const handleCursor = () => {
    keylog.CursorPosition.push(textarea.selectionEnd);
    startSelect.push(textarea.selectionStart);
    endSelect.push(textarea.selectionEnd);
  };

  const logCurrentText = () => {
    keylog.TextContent.push(textarea.value);
  };

  // ----------------------
  // Event handlers
  // ----------------------

  const handleKeyDown = (e) => {
    const now = Date.now();
    keylog.EventTime.push(now - taskonset);

    EventID++;
    keylog.EventID.push(EventID);

    if (e.key === " ") keylog.Output.push("Space");
    else if (e.key === "Unidentified")
      keylog.Output.push("VirtualKeyboardTouch");
    else keylog.Output.push(e.key);

    logCurrentText();
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

    logCurrentText();
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

  const finalize = () => {
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
      return;
    }

    keylog.TaskOnSet.push(taskonset);

    keylog.TextContent.push(String(textarea.value));
    keylog.FinalProduct = textarea.value;

    handleCursor();

    ActivityDetector(
      keylog,
      startSelect,
      endSelect,
      ActivityCancel,
      TextChangeCancel
    );

    // align arrays (same behavior as your original)
    keylog.TextChange.shift();
    keylog.Activity.shift();
    keylog.CursorPosition.shift();

    keylog.TaskEnd.push(Date.now());
  };

  // ----------------------
  // Attach listeners
  // ----------------------

  textarea.addEventListener("keydown", handleKeyDown);
  textarea.addEventListener("touchstart", handleTouchStart);
  textarea.addEventListener("mousedown", handleMouseDown);

  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      finalize();
    });
  }

  // ----------------------
  // Public API
  // ----------------------

  return {
    detach() {
      textarea.removeEventListener("keydown", handleKeyDown);
      textarea.removeEventListener("touchstart", handleTouchStart);
      textarea.removeEventListener("mousedown", handleMouseDown);
    },
    finalize,
    getKeylog() {
      return keylog;
    },
  };
}
