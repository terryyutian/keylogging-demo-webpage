// src/ActivityDetector.jsx

export function ActivityDetector(
  keylog,
  startSelect,
  endSelect,
  ActivityCancel,
  TextChangeCancel
) {
  // Helper: get nth from end (1 => last, 2 => second last). Returns defaultVal if missing.
  const getNthFromEnd = (arr, n = 1, defaultVal = "") => {
    if (!Array.isArray(arr) || arr.length < n) return defaultVal;
    return arr[arr.length - n];
  };

  const toNumber = (v, defaultVal = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : defaultVal;
  };

  const safeString = (v) => (v === null || v === undefined ? "" : String(v));

  // If no text content yet, label as nonproduction
  if (!Array.isArray(keylog.TextContent) || keylog.TextContent.length === 0) {
    keylog.TextChange.push("NoChange");
    keylog.Activity.push("Nonproduction");
    return;
  }

  // Current and previous text (safe)
  const prevText = safeString(getNthFromEnd(keylog.TextContent, 2, ""));
  const curText = safeString(getNthFromEnd(keylog.TextContent, 1, ""));
  const change = curText.length - prevText.length;

  // Safe selection and cursor reads (fall back to 0)
  const startPrev = toNumber(getNthFromEnd(startSelect, 2, 0), 0);
  const endPrev = toNumber(getNthFromEnd(endSelect, 2, 0), 0);
  const startNow = toNumber(getNthFromEnd(startSelect, 1, 0), 0);
  const endNow = toNumber(getNthFromEnd(endSelect, 1, 0), 0);

  // Safe cursor positions
  const cursorPrev = toNumber(getNthFromEnd(keylog.CursorPosition, 2, 0), 0);
  const cursorNow = toNumber(getNthFromEnd(keylog.CursorPosition, 1, 0), 0);

  // textNow is used as a working hypothesis of how old text + edits should form current text
  let textNow = prevText;

  // --- change === 0 : possible move, selection-only, or nonproduction ---
  if (change === 0) {
    // Detect move when selection ranges are non-empty and moved text matches
    const Text1 = prevText.slice(startPrev, endPrev);
    const Text2 = curText.slice(startNow, endNow);

    if (startPrev < endPrev && startNow < endNow && Text1 === Text2) {
      // movement detected
      if (startNow > startPrev && endNow > endPrev) {
        // front move
        const movedText = curText.slice(startNow, endNow);
        keylog.TextChange.push(movedText);
        TextChangeCancel.push(movedText);
        keylog.Activity.push(
          `Move From [${startPrev}, ${endPrev}] To [${startNow}, ${endNow}]`
        );
        ActivityCancel.push(
          `Move From [${startPrev}, ${endPrev}] To [${startNow}, ${endNow}]`
        );

        textNow =
          prevText.slice(0, startPrev) +
          prevText.slice(endPrev, endNow) +
          movedText +
          prevText.slice(endNow);
      } else if (startNow < startPrev && endNow < endPrev) {
        // back move
        const movedText = curText.slice(startNow, endNow);
        keylog.TextChange.push(movedText);
        TextChangeCancel.push(movedText);
        keylog.Activity.push(
          `Move From [${startPrev}, ${endPrev}] To [${startNow}, ${endNow}]`
        );
        ActivityCancel.push(
          `Move From [${startPrev}, ${endPrev}] To [${startNow}, ${endNow}]`
        );

        textNow =
          prevText.slice(0, startNow) +
          movedText +
          prevText.slice(startNow, startPrev) +
          prevText.slice(endPrev);
      } else if (startNow === startPrev && endNow === endPrev) {
        // no move
        keylog.TextChange.push("NoChange");
        TextChangeCancel.push("NoChange");
        keylog.Activity.push("Nonproduction");
        ActivityCancel.push("Nonproduction");
      } else if (startNow < startPrev && endNow > endPrev) {
        // selection expanded to cover more than before (likely nonproduction)
        keylog.TextChange.push("NoChange");
        TextChangeCancel.push("NoChange");
        keylog.Activity.push("Nonproduction");
        ActivityCancel.push("Nonproduction");
      } else {
        // fallback
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
      }
    } else if (
      startPrev === endPrev &&
      startNow < endNow &&
      prevText !== curText
    ) {
      // Cancel previously recorded move/replace action(s) — iterate from last to first and resolve one
      const changeN = ActivityCancel.length;
      for (let i = changeN - 1; i >= 0; i--) {
        const activity = safeString(ActivityCancel[i]);
        if (activity.startsWith("Move")) {
          keylog.TextChange.push(String(TextChangeCancel[i]));
          TextChangeCancel.splice(i, 1);

          const index1 = activity.indexOf("[");
          const index2 = activity.indexOf("]");
          const index3 = activity.lastIndexOf("[");
          const secondmove = activity.slice(index1, index2 + 1);
          const firstmove = activity.slice(index3);

          keylog.Activity.push(`Move From ${firstmove} To ${secondmove}`);
          ActivityCancel.splice(i, 1);
          textNow = curText;
          break;
        }

        if (activity.startsWith("Replace")) {
          const tc = safeString(TextChangeCancel[i]);
          const middleindex = tc.lastIndexOf(" => ");
          // guard indices
          if (middleindex > 0) {
            const substitute = tc.slice(5, middleindex);
            const replace = tc.slice(middleindex + 4);
            keylog.TextChange.push(`${replace} => ${substitute}`);
            keylog.Activity.push("Replace");
          } else {
            // fallback
            keylog.TextChange.push(tc);
            keylog.Activity.push("Replace");
          }
          TextChangeCancel.splice(i, 1);
          ActivityCancel.splice(i, 1);
          textNow = curText;
          break;
        }
      }
    } else {
      // generic non-change or replacement detection
      if (prevText === curText) {
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
      } else {
        // start a replace or autocorrect detection
        const start = startPrev;
        const end = endPrev;

        if (start < end) {
          // replace activity: replace n characters with n new characters
          const reconstructed =
            prevText.slice(0, start) +
            curText.substr(start, end + change - start) +
            prevText.slice(end);

          const replaced = prevText.substr(start, end - start);
          const substitute = curText.substr(start, end + change - start);

          if (reconstructed === curText) {
            if (replaced !== substitute) {
              keylog.TextChange.push(`${replaced} => ${substitute}`);
              TextChangeCancel.push(`${replaced} => ${substitute}`);
              keylog.Activity.push("Replace");
              ActivityCancel.push("Replace");
            } else {
              keylog.TextChange.push("NoChange");
              keylog.Activity.push("Nonproduction");
            }
          } else {
            AutoCorrectionDector(keylog);
            textNow = curText;
          }
        } else if (start === end) {
          // irregular replacement (auto-correction etc.)
          AutoCorrectionDector(keylog);
          textNow = curText;
        } else {
          // fallback
          AutoCorrectionDector(keylog);
          textNow = curText;
        }
      }
    }
  } // end change === 0

  // --- change === 1 : single char insert or replace/paste ---
  if (change === 1) {
    const start = startPrev;
    const end = endPrev;
    const index = endNow; // use endNow for the index where the insertion resulted

    // attempt to reconstruct and check if this was a simple input
    const charInserted = curText[index - 1] || "";
    const reconstructed =
      textNow.slice(0, index - 1) + charInserted + textNow.slice(index - 1);

    if (reconstructed === curText) {
      // simple input
      keylog.TextChange.push(charInserted);
      keylog.Activity.push("Input");
    } else {
      // either a replace (start < end) or an autocorrect
      if (start < end) {
        // regular paste/replace activity
        const newRecon =
          prevText.slice(0, start) +
          curText.substr(start, end + change - start) +
          prevText.slice(end);

        const replaced = prevText.substr(start, end - start);
        const substitute = curText.substr(start, end + change - start);

        if (newRecon === curText) {
          ReplaceDetector(replaced, substitute, keylog);
        } else {
          AutoCorrectionDector(keylog);
        }
      } else {
        AutoCorrectionDector(keylog);
      }
    }
  }

  // --- change > 1 : multi-character paste or large insertion ---
  if (change > 1) {
    const start = startPrev;
    const end = endPrev;
    const rangeStart = cursorPrev;
    const rangeEnd = cursorNow;
    // ensure sensible bounds
    const rs = Math.max(0, Math.min(rangeStart, curText.length));
    const re = Math.max(0, Math.min(rangeEnd, curText.length));
    const newlyAdded = curText.slice(rs, re);

    const reconstructed =
      textNow.slice(0, rs) + curText.slice(rs, re) + textNow.slice(rs);

    if (reconstructed === curText) {
      // Paste more than 1 character
      keylog.TextChange.push(newlyAdded);
      keylog.Activity.push("Paste");
    } else {
      if (start < end) {
        // replace activity
        const newRecon =
          prevText.slice(0, start) +
          curText.substr(start, end + change - start) +
          prevText.slice(end);

        const replaced = prevText.substr(start, end - start);
        const substitute = curText.substr(start, end + change - start);

        if (newRecon === curText) {
          ReplaceDetector(replaced, substitute, keylog);
        } else {
          AutoCorrectionDector(keylog);
        }
      } else if (start === end) {
        AutoCorrectionDector(keylog);
      } else {
        AutoCorrectionDector(keylog);
      }
    }
  }

  // --- change === -1 : single char delete/backspace ---
  if (change === -1) {
    const start = startPrev;
    const end = endPrev;
    const index = cursorPrev;
    const textinfo = prevText;
    let deleted = "";

    const outLastOutput = safeString(getNthFromEnd(keylog.Output, 2, ""));

    if (outLastOutput === "Delete" && start === end) {
      // delete at cursor
      deleted = textinfo[index] || "";
      textNow = textNow.slice(0, index) + textNow.slice(index + 1);
    } else {
      deleted = textinfo[index - 1] || "";
      textNow = textNow.slice(0, index - 1) + textNow.slice(index);
    }

    if (textNow === curText) {
      keylog.TextChange.push(deleted);
      keylog.Activity.push("Remove/Cut");
    } else {
      if (start < end) {
        // replace activity: replace n chars with n-1 new chars
        const newRecon =
          prevText.slice(0, start) +
          curText.substr(start, end + change - start) +
          prevText.slice(end);

        const replaced = prevText.substr(start, end - start);
        const substitute = curText.substr(start, end + change - start);

        if (newRecon === curText) {
          ReplaceDetector(replaced, substitute, keylog);
        } else {
          AutoCorrectionDector(keylog);
        }
      } else if (start === end) {
        AutoCorrectionDector(keylog);
      } else {
        AutoCorrectionDector(keylog);
      }
    }
  }

  // --- change < -1 : multi-character delete/cut ---
  if (change < -1) {
    const start = startPrev;
    const end = endPrev;
    const rangeStart = startPrev;
    const rangeEnd = endPrev;
    const textinfo = prevText;
    const deleted = textinfo.slice(rangeStart, rangeEnd);

    textNow = textNow.slice(0, rangeStart) + textNow.slice(rangeEnd);

    if (textNow === curText) {
      keylog.TextChange.push(deleted);
      keylog.Activity.push("Remove/Cut");
    } else {
      if (start < end) {
        const newRecon =
          prevText.slice(0, start) +
          curText.substr(start, end + change - start) +
          prevText.slice(end);

        const replaced = prevText.substr(start, end - start);
        const substitute = curText.substr(start, end + change - start);

        if (newRecon === curText) {
          ReplaceDetector(replaced, substitute, keylog);
        } else {
          AutoCorrectionDector(keylog);
        }
      } else if (start === end) {
        AutoCorrectionDector(keylog);
      } else {
        AutoCorrectionDector(keylog);
      }
    }
  }
}

// -------- Helper functions retained from original code (with safer expectations) --------

function AutoCorrectionDector(keylog) {
  const getNthFromEnd = (arr, n = 1, defaultVal = "") =>
    !Array.isArray(arr) || arr.length < n ? defaultVal : arr[arr.length - n];
  const safeString = (v) => (v === null || v === undefined ? "" : String(v));

  let oldText = safeString(getNthFromEnd(keylog.TextContent, 2, ""));
  let newText = safeString(getNthFromEnd(keylog.TextContent, 1, ""));

  if (oldText !== newText) {
    let oldTextLen = oldText.length;
    let newTextLen = newText.length;

    // Find the index at which the change ended (relative to the end of the string)
    let e = 0; // use current cursor position
    while (
      e < oldTextLen &&
      e < newTextLen &&
      oldText[oldTextLen - 1 - e] === newText[newTextLen - 1 - e]
    ) {
      e++;
    }
    // the change end of old text and new text
    let oldTextChangeEnd = oldTextLen - e;
    let newTextChangeEnd = newTextLen - e;

    // find the index at which the change started -- limit changed characters to 100 to avoid heavy work
    let s;
    if (oldTextLen - e <= 100 || newTextLen - e <= 100) {
      s = 0;
      while (s < oldTextLen && s < newTextLen && oldText[s] === newText[s]) {
        s++;
      }
    } else {
      s = Math.min(oldTextLen - e, newTextLen - e);
      while (s < oldTextLen && s < newTextLen && oldText[s] === newText[s]) {
        s++;
      }
    }

    let replaced = oldText.slice(s, oldTextChangeEnd);
    let substitute = newText.slice(s, newTextChangeEnd);
    if (replaced.length > 0 && substitute.length > 0) {
      if (replaced !== substitute) {
        keylog.TextChange.push(`${replaced} => ${substitute}`);
        keylog.Activity.push("AutoCorrectionReplace");
      } else {
        keylog.TextChange.push("NoChange");
        keylog.Activity.push("Nonproduction");
      }
    } else if (replaced.length > 0 && substitute.length === 0) {
      keylog.TextChange.push(replaced);
      keylog.Activity.push("AutoCorrectionRemove/Cut");
    } else if (replaced.length === 0 && substitute.length > 0) {
      keylog.TextChange.push(substitute);
      keylog.Activity.push("AutoCorrectionPaste");
    } else {
      keylog.TextChange.push("NoChange");
      keylog.Activity.push("Nonproduction");
    }

    // cursorPosition adjustment
    let thisPosition = newTextChangeEnd;
    if (!Array.isArray(keylog.CursorPosition)) keylog.CursorPosition = [];
    // replace last only if exists, otherwise push
    if (keylog.CursorPosition.length > 0) {
      keylog.CursorPosition.pop(); // remove the last value
      keylog.CursorPosition.push(thisPosition); // add the new position
    } else {
      keylog.CursorPosition.push(thisPosition);
    }
  } else {
    keylog.TextChange.push("NoChange");
    keylog.Activity.push("Nonproduction");
  }
}

function ReplaceDetector(replaced, substitute, keylog) {
  if (replaced.length > 0 && substitute.length > 0) {
    if (replaced !== substitute) {
      keylog.TextChange.push(`${replaced} => ${substitute}`);
      keylog.Activity.push("Replace");
    } else {
      keylog.TextChange.push("NoChange");
      keylog.Activity.push("Nonproduction");
    }
  } else if (replaced.length > 0 && substitute.length === 0) {
    keylog.TextChange.push(replaced);
    keylog.Activity.push("Remove/Cut");
  } else if (replaced.length === 0 && substitute.length > 0) {
    keylog.TextChange.push(substitute);
    keylog.Activity.push("Paste");
  } else {
    keylog.TextChange.push("NoChange");
    keylog.Activity.push("Nonproduction");
  }
}
