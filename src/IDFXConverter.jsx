// -------------------------
// XML SAFE HELPERS
// -------------------------

function escapeXML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function meta_xml(key, value) {
  return `  <entry>\n    <key>${escapeXML(key)}</key>\n    <value>${escapeXML(
    value
  )}</value>\n  </entry>\n`;
}

function keylogConvert(event_type, event_id, part_type, log_info) {
  let xml = `  <event type="${escapeXML(event_type)}" id="${event_id}">\n`;
  xml += `    <part type="${escapeXML(part_type)}">\n`;

  for (const key in log_info) {
    const raw = log_info[key];
    if (raw === "NoValue") {
      xml += `      <${escapeXML(key)} />\n`;
    } else {
      xml += `      <${escapeXML(key)}>${escapeXML(raw)}</${escapeXML(
        key
      )}>\n`;
    }
  }

  xml += `    </part>\n`;
  xml += `  </event>\n`;
  return xml;
}

// Safe xmlMerge that prevents errors
function xmlMerge(xmlA, xmlB) {
  const regex = /(<event[^>]*>)([\s\S]*?)(<\/event>)/;
  const partsA = xmlA.match(regex);
  const partsB = xmlB.match(regex);

  if (!partsA || !partsB) {
    // Fallback: return A then B separately
    return xmlA + xmlB;
  }

  return partsA[1] + partsA[2] + partsB[2] + partsA[3];
}

// -------------------------
// MAIN EXPORT
// -------------------------

export function IDFXConverter(keylog) {
  if (!keylog) return "";

  const safeArr = (arr) => (Array.isArray(arr) ? arr : []);

  const EventIDArr = safeArr(keylog.EventID);
  const EventTimeArr = safeArr(keylog.EventTime);
  const OutputArr = safeArr(keylog.Output);
  const CursorArr = safeArr(keylog.CursorPosition);
  const TextChangeArr = safeArr(keylog.TextChange);
  const ActivityArr = safeArr(keylog.Activity);

  let docLength = 0;
  let extraEventOffset = 0; // replaces the old AddID

  const SpecialDownValues = [
    "Meta",
    "Unidentified",
    "AudioVolumeUp",
    "AudioVolumeDown",
    "Dead",
    "Process",
    "AltGraph",
    "ContextMenu",
    "NumLock",
    "Insert",
    "ScrollLock",
    "MediaPlayPause",
    "MediaTrackNext",
    "Escape",
    "Cancel",
  ];

  // -----------------------------------
  // XML HEADER
  // -----------------------------------

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n<log>\n`;

  const now = Date.now();
  const date = new Date();
  const idfxname = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  xml += `<meta>\n`;
  xml += meta_xml("__LogProgramVersion", "7.0.0.2");
  xml += meta_xml("__LogCreationDate", now);
  xml += meta_xml("__GUID", "0");
  xml += meta_xml("__LogRelativeCreationDate", now);
  xml += meta_xml("__LogFileName", idfxname);
  xml += `</meta>\n`;

  xml += `<session>\n`;
  xml += meta_xml("Participant", idfxname);
  xml += meta_xml("Text Language", "EN");
  xml += meta_xml("Age", "Unknown");
  xml += meta_xml("Gender", "Unknown");
  xml += meta_xml("Session", "1");
  xml += meta_xml("Keyboard", "Unknown");
  xml += meta_xml("Group", "1");
  xml += meta_xml("Experience", "0");
  xml += meta_xml("Restricted Logging", "0");
  xml += `</session>\n`;

  // -----------------------------------
  // UTILITY: Robust safe lookup
  // -----------------------------------

  const safe = (arr, i, fallback = "") =>
    i < arr.length && arr[i] !== undefined ? arr[i] : fallback;

  const safeNum = (arr, i, fallback = 0) => {
    const n = Number(safe(arr, i));
    return Number.isFinite(n) ? n : fallback;
  };

  const parseMoveNumbers = (activity) => {
    const nums = activity.match(/\d+/g);
    if (!nums || nums.length < 2) return null;
    return nums.map((x) => Number(x));
  };

  // -----------------------------------
  // MAIN LOOP
  // -----------------------------------

  const n = EventIDArr.length;

  for (let i = 0; i < n; i++) {
    // base event ID (plus any offset)
    let baseID = Number(EventIDArr[i]) + extraEventOffset;
    const output = String(safe(OutputArr, i));
    let activity = String(safe(ActivityArr, i));
    let textChange = String(safe(TextChangeArr, i));
    if (textChange === "NoChange") textChange = "";

    const textLen = textChange.length;

    // Update doc length
    if (activity === "Input") docLength += 1;
    else if (activity.includes("Remove/Cut")) docLength -= textLen;
    else if (activity.includes("Paste")) docLength += textLen;
    else if (activity.includes("Replace")) {
      const parts = textChange.split(" => ");
      if (parts.length === 2) {
        docLength -= parts[0].length;
        docLength += parts[1].length;
      }
    }

    // -----------------------
    // PARAMS
    // -----------------------
    let DownValue = output;
    let paramKey = "VK_" + output.toUpperCase();

    // Cursor / Times
    let pos = safeNum(CursorArr, i);
    let start = safeNum(EventTimeArr, i);
    let end = safeNum(EventTimeArr, i);

    // Mapping click → virtual keys (unchanged per your request)
    if (DownValue === "Leftclick") paramKey = "VK_LBUTTON";
    if (DownValue === "Rightclick") paramKey = "VK_RBUTTON";
    if (DownValue === "Middleclick") paramKey = "VK_MBUTTON";

    if (DownValue === "Backspace") paramKey = "VK_BACK";
    if (DownValue === "Enter") paramKey = "VK_RETURN";
    if (DownValue === "Alt") paramKey = "VK_MENU";
    if (DownValue === "CapsLock") paramKey = "VK_CAPITAL";
    if (DownValue === "PageUp") paramKey = "VK_PRIOR";
    if (DownValue === "PageDown") paramKey = "VK_NEXT";

    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(DownValue))
      paramKey = "VK_" + DownValue.replace("Arrow", "").toUpperCase();

    // OEM keys
    const oemMap = {
      ";": "VK_OEM_1",
      ":": "VK_OEM_1",
      "=": "VK_OEM_PLUS",
      "+": "VK_OEM_PLUS",
      ",": "VK_OEM_COMMA",
      "<": "VK_OEM_COMMA",
      "-": "VK_OEM_MINUS",
      "_": "VK_OEM_MINUS",
      ".": "VK_OEM_PERIOD",
      ">": "VK_OEM_PERIOD",
      "/": "VK_OEM_2",
      "?": "VK_OEM_2",
      "`": "VK_OEM_3",
      "~": "VK_OEM_3",
      "[": "VK_OEM_4",
      "{": "VK_OEM_4",
      "\\": "VK_OEM_5",
      "|": "VK_OEM_5",
      "]": "VK_OEM_6",
      "}": "VK_OEM_6",
      "'": "VK_OEM_7",
      '"': "VK_OEM_7",
      "!": "VK_1",
      "@": "VK_2",
      "#": "VK_3",
      "$": "VK_4",
      "%": "VK_5",
      "^": "VK_6",
      "&": "VK_7",
      "*": "VK_8",
      "(": "VK_9",
      ")": "VK_0",
    };
    if (oemMap[DownValue]) paramKey = oemMap[DownValue];

    // SPECIAL DOWN VALUES (BUG #9 IGNORED per request)
    if (SpecialDownValues.includes(DownValue)) {
      paramKey = "VK_LWIN"; // intentionally preserved
    }

    // paramValue rules
    let paramValue = "NoValue";
    if (DownValue === "Backspace") paramValue = "&#x8;";
    else if (DownValue === "Space") paramValue = " ";
    else if (DownValue === "Enter") paramValue = "\n";
    else if (DownValue.length === 1 && textLen === 1) {
      // actual typed character
      paramValue = textChange;
    }

    // INPUT TYPE
    const inputType = output.includes("click") ? "mouse" : "keyboard";
    const button = inputType === "mouse" ? output.replace("click", "").toUpperCase() : "";

    // -------------------------------------------------------
    // Now we generate batches similar to your original logic
    // but with robust fallbacks to avoid crashing.
    // -------------------------------------------------------

    function addEvent(eventType, partType, info) {
      xml += keylogConvert(eventType, baseID, partType, info);
      baseID++;
    }

    function addMerged(eventA, eventB) {
      xml += xmlMerge(eventA, eventB);
      baseID++;
    }

    // ------------------
    // INPUTTYPE LOGIC
    // ------------------

    if (inputType === "mouse") {
      // PASTE
      if (activity === "Paste") {
        addEvent("mouse", "winlog", {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button,
        });

        addEvent("insert", "wordlog", {
          position: pos,
          before: textChange,
          after: "",
        });

        addEvent("selection", "wordlog", {
          start: pos,
          end: pos,
        });

        extraEventOffset += 2;
        continue;
      }

      // REPLACE
      if (activity === "Replace") {
        const parts = textChange.split(" => ");
        if (parts.length === 2) {
          const before = parts[0];
          const after = parts[1];

          const startPos = pos - after.length;
          const endPos = startPos + before.length;

          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: before,
          });
          addEvent("selection", "wordlog", { start: startPos, end: endPos });
          addEvent("mouse", "winlog", {
            startTime: start,
            endTime: end,
            x: "0",
            y: "0",
            type: "click",
            button,
          });
          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: after,
          });
          addEvent("selection", "wordlog", {
            start: endPos,
            end: endPos,
          });

          extraEventOffset += 4;
          continue;
        }
      }

      // REMOVE
      if (activity.includes("Remove/Cut")) {
        let deleted = textLen;
        let startPos = pos;
        let endPos = pos + deleted;

        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: textChange,
        });
        addEvent("selection", "wordlog", { start: startPos, end: endPos });
        addEvent("mouse", "winlog", {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button,
        });
        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: "NoValue",
        });
        addEvent("selection", "wordlog", { start: startPos, end: startPos });

        extraEventOffset += 4;
        continue;
      }

      // MOVE
      if (activity.includes("Move")) {
        const nums = parseMoveNumbers(activity);
        if (!nums || nums.length < 4) continue;

        const [startFrom, endFrom, startTo, endTo] = nums;

        // First: click batch
        addEvent("mouse", "winlog", {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button,
        });

        // Remove batch
        const deleted = textLen;
        addEvent("replacement", "wordlog", {
          start: startFrom,
          end: startFrom + deleted,
          newtext: textChange,
        });
        addEvent("selection", "wordlog", {
          start: startFrom,
          end: startFrom + deleted,
        });
        addEvent("replacement", "wordlog", {
          start: startFrom,
          end: startFrom + deleted,
          newtext: "NoValue",
        });
        addEvent("selection", "wordlog", {
          start: startFrom,
          end: startFrom,
        });

        // Paste batch
        addEvent("insert", "wordlog", {
          position: endTo,
          before: textChange,
          after: "NoValue",
        });
        addEvent("selection", "wordlog", {
          start: endTo,
          end: endTo,
        });

        extraEventOffset += 6;
        continue;
      }
    }

    // -------------------------
    // KEYBOARD LOGIC
    // -------------------------

    if (inputType === "keyboard") {
      // DELETE
      if (DownValue === "Delete") {
        const deleted = textLen;
        const startPos = pos;
        const endPos = pos + deleted;
        const prior = docLength + deleted;

        // replacement
        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: textChange,
        });

        // selection
        addEvent("selection", "wordlog", { start: startPos, end: endPos });

        // keyboard wordlog + winlog
        const w1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: pos,
          documentLength: prior,
          replay: "False",
        });

        const w2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        });

        addMerged(w1, w2);

        // replacement (NoValue)
        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: "NoValue",
        });

        // selection
        addEvent("selection", "wordlog", {
          start: startPos,
          end: startPos,
        });

        extraEventOffset += 4;
        continue;
      }

      // BACKSPACE (multiple)
      if (DownValue === "Backspace" && textLen > 1) {
        const deleted = textLen;
        const startPos = pos;
        const endPos = pos + deleted;
        const prior = docLength + deleted;

        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: textChange,
        });
        addEvent("selection", "wordlog", { start: startPos, end: endPos });

        const k1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: pos,
          documentLength: prior,
          replay: "False",
        });
        const k2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: paramValue === "unrecognized" ? "NoValue" : paramValue,
          keyboardstate: "NoValue",
        });
        addMerged(k1, k2);

        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: "NoValue",
        });
        addEvent("selection", "wordlog", { start: startPos, end: startPos });

        extraEventOffset += 4;
        continue;
      }

      // REMOVE/CUT via CTRL+X
      if (activity === "Remove/Cut" && paramKey === "VK_X") {
        const deleted = textLen;
        const startPos = pos;
        const endPos = pos + deleted;
        const prior = docLength + deleted;

        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: textChange,
        });
        addEvent("selection", "wordlog", { start: startPos, end: endPos });

        const k1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: startPos,
          documentLength: prior,
          replay: "False",
        });
        const k2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "<key>VK_LCONTROL</key>",
        });
        addMerged(k1, k2);

        addEvent("replacement", "wordlog", {
          start: startPos,
          end: endPos,
          newtext: "NoValue",
        });
        addEvent("selection", "wordlog", { start: startPos, end: startPos });

        extraEventOffset += 4;
        continue;
      }

      // PASTE via CTRL+V
      if (activity === "Paste" && paramKey === "VK_V") {
        const pasted = textLen;
        const startPos = pos - pasted;
        const endPos = pos;
        const prior = docLength - pasted;

        const w1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: startPos,
          documentLength: prior,
          replay: "False",
        });
        const w2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "<key>VK_LCONTROL</key>",
        });
        addMerged(w1, w2);

        addEvent("insert", "wordlog", {
          position: endPos,
          before: textChange,
          after: "NoValue",
        });

        addEvent("selection", "wordlog", { start: endPos, end: endPos });

        extraEventOffset += 2;
        continue;
      }

      // PASTE (not via VK_V)
      if (activity === "Paste" && paramKey !== "VK_V") {
        const pasted = textLen;
        const startPos = pos - pasted;
        const endPos = pos;
        const prior = docLength - pasted;

        const w1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: startPos,
          documentLength: prior,
          replay: "False",
        });
        const w2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        });
        addMerged(w1, w2);

        addEvent("insert", "wordlog", {
          position: endPos,
          before: textChange,
          after: "NoValue",
        });
        addEvent("selection", "wordlog", { start: endPos, end: endPos });

        extraEventOffset += 2;
        continue;
      }

      // REPLACE via VK_V
      if (activity === "Replace" && paramKey === "VK_V") {
        const parts = textChange.split(" => ");
        if (parts.length === 2) {
          const before = parts[0];
          const after = parts[1];

          const startPos = pos - after.length;
          const endPos = startPos + before.length;

          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: before,
          });
          addEvent("selection", "wordlog", {
            start: startPos,
            end: endPos,
          });

          const w1 = keylogConvert("keyboard", baseID, "wordlog", {
            position: startPos,
            documentLength: docLength,
            replay: "False",
          });
          const w2 = keylogConvert("keyboard", baseID, "winlog", {
            startTime: start,
            endTime: end,
            key: paramKey,
            value: "NoValue",
            keyboardstate: "NoValue",
          });
          addMerged(w1, w2);

          addEvent("keyboard", "wordlog", {
            position: startPos,
            documentLength: docLength,
            replay: "False",
          });

          addEvent("keyboard", "winlog", {
            startTime: start,
            endTime: end,
            key: paramKey,
            value: after,
            keyboardstate: "<key>VK_LCONTROL</key>",
          });

          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: after,
          });
          addEvent("selection", "wordlog", {
            start: endPos,
            end: endPos,
          });

          extraEventOffset += 5;
          continue;
        }
      }

      // REPLACE (other)
      if (activity === "Replace" && paramKey !== "VK_V") {
        const parts = textChange.split(" => ");
        if (parts.length === 2) {
          const before = parts[0];
          const after = parts[1];
          const startPos = pos - after.length;
          const endPos = startPos + before.length;

          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: before,
          });
          addEvent("selection", "wordlog", {
            start: startPos,
            end: endPos,
          });

          const w1 = keylogConvert("keyboard", baseID, "wordlog", {
            position: startPos,
            documentLength: docLength,
            replay: "False",
          });
          const w2 = keylogConvert("keyboard", baseID, "winlog", {
            startTime: start,
            endTime: end,
            key: paramKey,
            value: after,
            keyboardstate: "NoValue",
          });
          addMerged(w1, w2);

          addEvent("replacement", "wordlog", {
            start: startPos,
            end: endPos,
            newtext: after,
          });
          addEvent("selection", "wordlog", {
            start: endPos,
            end: endPos,
          });

          extraEventOffset += 4;
          continue;
        }
      }

      // ENTER
      if (DownValue === "Enter") {
        const w1 = keylogConvert("keyboard", baseID, "wordlog", {
          position: pos,
          documentLength: docLength,
          replay: "True",
        });
        const w2 = keylogConvert("keyboard", baseID, "winlog", {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        });
        addMerged(w1, w2);
        continue;
      }

      // DEFAULT KEYBOARD INPUT
      const w1 = keylogConvert("keyboard", baseID, "wordlog", {
        position: pos,
        documentLength: docLength,
        replay: "True",
      });
      const w2 = keylogConvert("keyboard", baseID, "winlog", {
        startTime: start,
        endTime: end,
        key: paramKey,
        value: paramValue === "unrecognized" ? "NoValue" : paramValue,
        keyboardstate: "NoValue",
      });
      addMerged(w1, w2);
    }
  }

  xml += `</log>`;
  return xml;
}
