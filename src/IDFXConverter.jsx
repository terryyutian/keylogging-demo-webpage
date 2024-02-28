function meta_xml(key, value) {
  let xmlString = ` <entry> <key>${key}</key> <value>${value}</value> </entry> \n`;
  return xmlString;
}

// process and convert keystroke logs
function keylogConvert(event_type, event_id, part_type, log_info) {
  let xmlString = "";
  xmlString +=
    ` <event type="${event_type}" id="${event_id}"> \n` +
    ` <part type="${part_type}"> \n`;
  for (const key in log_info) {
    if (log_info[key] != "NoValue") {
      xmlString += ` <${key}>${log_info[key]}</${key}> \n`;
    } else {
      xmlString += ` <${key} /> \n`;
    }
  }
  xmlString += "</part>\n</event>\n";
  return xmlString;
}

function xmlMerge(xmlString_1, xmlString_2) {
  // xmlString_1 and xmlString_2 share the same event parent
  let chunks = /(<event[^>]*>)([\s\S]*?)(<\/event>)/;
  let xmlString_1_parts = xmlString_1.match(chunks);
  let xmlString_2_parts = xmlString_2.match(chunks);
  let newxmlString =
    xmlString_1_parts[1] +
    xmlString_1_parts[2] +
    xmlString_2_parts[2] +
    xmlString_1_parts[3];
  return newxmlString;
}

export function IDFXConverter(keylog) {
  // add title
  let idfxString = '<?xml version="1.0" encoding="utf-8"?> \n';

  // add meta data
  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  const idfxname = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  idfxString +=
    " <log> \n" +
    " <meta> \n" +
    meta_xml("__LogProgramVersion", "7.0.0.2") +
    meta_xml("__LogCreationDate", `${currentTime}`) +
    meta_xml("__GUID", "0") +
    meta_xml("__LogRelativeCreationDate", `${currentTime}`) +
    meta_xml("__LogFileName", idfxname) +
    "</meta> \n";

  // add session info
  idfxString +=
    " <session> \n" +
    meta_xml("Participant", idfxname) +
    meta_xml("Text Language", "EN") +
    meta_xml("Age", "Unknown") +
    meta_xml("Gender", "Unknown") +
    meta_xml("Session", "1") +
    meta_xml("Keyboard", "Unknown") +
    meta_xml("Group", "1") +
    meta_xml("Experience", "0") +
    meta_xml("Restricted Logging", "0") +
    "</session> \n";

  // add keylog info
  let docLength = 0;
  let AddID = 0;

  const log_n = keylog.EventID.length;
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

  for (let i = 0; i <= log_n - 1; i++) {
    let EventID = parseInt(keylog.EventID[i]) + AddID;
    let Activity = String(keylog.Activity[i]);

    // define TextChange
    let TextChange = String(keylog.TextChange[i]);

    if (TextChange == "NoChange") {
      TextChange = "";
    }

    let TextChangeN = TextChange.length;

    // Add docLength info
    if (Activity == "Input") {
      docLength += 1;
    } else if (Activity.includes("Remove/Cut")) {
      let deleted = TextChangeN;
      docLength -= deleted;
    } else if (Activity.includes("Paste")) {
      let pasted = TextChangeN;
      docLength += pasted;
    } else if (Activity.includes("Replace")) {
      const TextChange_split = TextChange.split(" => ");
      const before = TextChange_split[0];
      const after = TextChange_split[1];
      const beforeN = before.length;
      const afterN = after.length;
      docLength = docLength - beforeN + afterN;
    } else {
      docLength = docLength;
    }

    // decide the input type
    let output = String(keylog.Output[i]);
    let inputtype = "";
    let button = "";
    if (output.includes("click")) {
      inputtype = "mouse";
      button = output.replace("click", "").toUpperCase();
    } else {
      inputtype = "keyboard";
    }

    // extract values
    let DownValue = output;
    let paramKey = "VK_" + output.toUpperCase();
    let paramPosition = parseInt(keylog.CursorPosition[i]);
    let start = parseInt(keylog.EventTime[i]);
    let end = parseInt(keylog.EventTime[i]);

    if (DownValue == "Leftclick") {
      paramKey = "VK_LBUTTON";
    }
    if (DownValue == "Rightclick") {
      paramKey = "VK_RBUTTON";
    }
    if (DownValue == "Middleclick") {
      paramKey = "VK_MBUTTON";
    }
    if (DownValue == "Backspace") {
      paramKey = "VK_BACK";
    }
    if (DownValue == "Enter") {
      paramKey = "VK_RETURN";
    }
    if (DownValue == "Alt") {
      paramKey = "VK_MENU";
    }
    if (DownValue == "CapsLock") {
      paramKey = "VK_CAPITAL";
    }
    if (DownValue == "PageUp") {
      paramKey = "VK_PRIOR";
    }
    if (DownValue == "PageDown") {
      paramKey = "VK_NEXT";
    }
    if (DownValue == "ArrowLeft") {
      paramKey = "VK_LEFT";
    }
    if (DownValue == "ArrowUp") {
      paramKey = "VK_UP";
    }
    if (DownValue == "ArrowRight") {
      paramKey = "VK_RIGHT";
    }
    if (DownValue == "ArrowDown") {
      paramKey = "VK_DOWN";
    }

    if (DownValue == ";" || DownValue == ":") {
      paramKey = "VK_OEM_1";
    }
    if (DownValue == "=" || DownValue == "+") {
      paramKey = "VK_OEM_PLUS";
    }
    if (DownValue == "," || DownValue == "<") {
      paramKey = "VK_OEM_COMMA";
    }
    if (DownValue == "-" || DownValue == "_") {
      paramKey = "VK_OEM_MINUS";
    }
    if (DownValue == "." || DownValue == ">") {
      paramKey = "VK_OEM_PERIOD";
    }
    if (DownValue == "/" || DownValue == "?") {
      paramKey = "VK_OEM_2";
    }
    if (DownValue == "`" || DownValue == "~") {
      paramKey = "VK_OEM_3";
    }
    if (DownValue == "[" || DownValue == "{") {
      paramKey = "VK_OEM_4";
    }
    if (DownValue == "\\" || DownValue == "|") {
      paramKey = "VK_OEM_5";
    }
    if (DownValue == "]" || DownValue == "}") {
      paramKey = "VK_OEM_6";
    }
    if ((DownValue == "'") | (DownValue == '"')) {
      paramKey = "VK_OEM_7";
    }
    if (DownValue == "!") {
      paramKey = "VK_1";
    }
    if (DownValue == "@") {
      paramKey = "VK_2";
    }
    if (DownValue == "#") {
      paramKey = "VK_3";
    }
    if (DownValue == "$") {
      paramKey = "VK_4";
    }
    if (DownValue == "%") {
      paramKey = "VK_5";
    }
    if (DownValue == "^") {
      paramKey = "VK_6";
    }
    if (DownValue == "&") {
      paramKey = "VK_7";
    }
    if (DownValue == "&") {
      paramKey = "VK_7";
    }
    if (DownValue == "*") {
      paramKey = "VK_8";
    }
    if (DownValue == "(") {
      paramKey = "VK_9";
    }
    if (DownValue == ")") {
      paramKey = "VK_0";
    }

    if (SpecialDownValues.includes(DownValue)) {
      paramKey = "VK_LWIN";
    }

    // set value for key activities
    let paramValue = "";
    if (DownValue == "Backspace") {
      paramValue = "&#x8;";
    } else if (DownValue == "Space") {
      paramValue = " ";
    } else if (DownValue == "Enter") {
      paramValue = "\n";
    } else if (DownValue.length == 1) {
      paramValue = TextChange;
    } else {
      paramValue = "unrecognized";
    }

    if (inputtype == "mouse") {
      if (Activity == "Paste") {
        let endPosition = paramPosition;

        // first batch
        let log_info_1 = {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button: button,
        };
        let new_xml_1 = keylogConvert("mouse", EventID, "winlog", log_info_1);
        idfxString += new_xml_1;
        EventID += 1;

        // Second batch
        let log_info_2 = {
          position: endPosition,
          before: TextChange,
          after: "",
        };
        let new_xml_2 = keylogConvert("insert", EventID, "wordlog", log_info_2);
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          start: endPosition,
          end: endPosition,
        };

        let new_xml_3 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_3
        );
        idfxString += new_xml_3;

        AddID < -AddID + 2;
      }

      if (Activity == "Replace") {
        const TextChange_split = TextChange.split(" => ");
        const before = TextChange_split[0];
        const after = TextChange_split[1];
        const beforeN = before.length;
        const afterN = after.length;

        let startPosition = paramPosition - afterN;
        let endPosition = paramPosition - afterN + beforeN;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: before,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button: button,
        };
        let new_xml_3 = keylogConvert("mouse", EventID, "winlog", log_info_3);
        idfxString += new_xml_3;
        EventID += 1;

        // fourth batch
        let log_info_4 = {
          start: startPosition,
          end: endPosition,
          newtext: after,
        };
        let new_xml_4 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_4
        );
        idfxString += new_xml_4;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_5 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;

        AddID < -AddID + 4;
      }

      if (Activity == "Remove/Cut") {
        let deleted = TextChangeN;
        let startPosition = paramPosition;
        let endPosition = paramPosition + deleted;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: TextChange,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button: button,
        };
        let new_xml_3 = keylogConvert("mouse", EventID, "winlog", log_info_3);
        idfxString += new_xml_3;
        EventID += 1;

        // fourth batch
        let log_info_4 = {
          start: startPosition,
          end: endPosition,
          newtext: "NoValue",
        };
        let new_xml_4 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_4
        );
        idfxString += new_xml_4;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: startPosition,
          end: startPosition,
        };
        let new_xml_5 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;

        AddID < -AddID + 4;
      }

      if (Activity.includes("Move")) {
        // new batch
        let log_info = {
          startTime: start,
          endTime: end,
          x: "0",
          y: "0",
          type: "click",
          button: button,
        };
        let new_xml = keylogConvert("mouse", EventID, "winlog", log_info);
        idfxString += new_xml;
        EventID += 1;

        // first step: remove/cut
        let numbers = Activity.match(/\d+/g);
        let startn = parseInt(numbers[0]);

        let deleted = TextChangeN;
        let startPosition = startn;
        let endPosition = startPosition + deleted;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: TextChange,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          start: startPosition,
          end: endPosition,
          newtext: "NoValue",
        };
        let new_xml_3 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_3
        );
        idfxString += new_xml_3;
        EventID += 1;

        // fourth batch
        let log_info_4 = {
          start: startPosition,
          end: startPosition,
        };
        let new_xml_4 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_4
        );
        idfxString += new_xml_4;
        EventID += 1;

        // second step: paste

        let paste_end = parseInt(numbers[3]);
        let pasted = TextChangeN;
        startPosition = paramPosition - pasted;
        endPosition = paste_end;

        // fifth batch
        let log_info_5 = {
          position: endPosition,
          before: TextChange,
          after: "NoValue",
        };
        let new_xml_5 = keylogConvert("insert", EventID, "wordlog", log_info_5);
        idfxString += new_xml_5;
        EventID += 1;

        // Sixth batch
        let log_info_6 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_6 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_6
        );
        idfxString += new_xml_6;

        AddID < -AddID + 6;
      }
    }

    if (inputtype == "keyboard") {
      if (DownValue == "Delete") {
        let deleted = TextChangeN;
        let docLength_prior = docLength + deleted;
        let startPosition = paramPosition;
        let endPosition = paramPosition + deleted;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: TextChange,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: paramPosition,
          documentLength: docLength_prior,
          replay: "False",
        };
        let new_xml_3 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_3
        );

        // fourth batch
        let log_info_4 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };
        let new_xml_4 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_4
        );

        // Merge batch 3 and batch 4
        let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
        idfxString += mergedxmlString;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: startPosition,
          end: endPosition,
          newtext: "NoValue",
        };
        let new_xml_5 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;
        EventID += 1;

        // Sixth batch
        let log_info_6 = {
          start: startPosition,
          end: startPosition,
        };
        let new_xml_6 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_6
        );
        idfxString += new_xml_6;

        AddID < -AddID + 4;
      } else if ((DownValue == "Backspace") & (TextChangeN > 1)) {
        let deleted = TextChangeN;
        let docLength_prior = docLength + deleted;
        let startPosition = paramPosition;
        let endPosition = paramPosition + deleted;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: TextChange,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // Second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: paramPosition,
          documentLength: docLength_prior,
          replay: "False",
        };
        let new_xml_3 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_3
        );

        // fourth batch
        let log_info_4 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };

        if (paramValue != "unrecognized") {
          log_info_4["value"] = paramValue;
        }
        let new_xml_4 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_4
        );

        // Merge batch 3 and batch 4
        let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
        idfxString += mergedxmlString;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: startPosition,
          end: endPosition,
          newtext: "NoValue",
        };
        let new_xml_5 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;
        EventID += 1;

        // Sixth batch
        let log_info_6 = {
          start: startPosition,
          end: startPosition,
        };
        let new_xml_6 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_6
        );
        idfxString += new_xml_6;

        AddID < -AddID + 4;
      } else if ((Activity == "Remove/Cut") & (paramKey == "VK_X")) {
        let deleted = TextChangeN;
        let docLength_prior = docLength + deleted;
        let startPosition = paramPosition;
        let endPosition = paramPosition + deleted;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: TextChange,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: startPosition,
          documentLength: docLength_prior,
          replay: "False",
        };
        let new_xml_3 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_3
        );

        // fourth batch
        let log_info_4 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "<key>VK_LCONTROL</key>",
        };

        let new_xml_4 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_4
        );
        // Merge batch 3 and batch 4
        let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
        idfxString += mergedxmlString;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: startPosition,
          end: endPosition,
          newtext: "NoValue",
        };
        let new_xml_5 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;
        EventID += 1;

        // Sixth batch
        let log_info_6 = {
          start: startPosition,
          end: startPosition,
        };
        let new_xml_6 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_6
        );
        idfxString += new_xml_6;

        AddID < -AddID + 4;
      } else if ((Activity == "Paste") & (paramKey == "VK_V")) {
        let pasted = TextChangeN;
        let docLength_prior = docLength - pasted;
        let startPosition = paramPosition - pasted;
        let endPosition = paramPosition;

        // first batch
        let log_info_1 = {
          position: startPosition,
          documentLength: docLength_prior,
          replay: "False",
        };
        let new_xml_1 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_1
        );

        // second batch
        let log_info_2 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "<key>VK_LCONTROL</key>",
        };

        let new_xml_2 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_2
        );
        // Merge batch 1 and batch 2
        let mergedxmlString = xmlMerge(new_xml_1, new_xml_2);
        idfxString += mergedxmlString;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: endPosition,
          before: TextChange,
          after: "NoValue",
        };
        let new_xml_3 = keylogConvert("insert", EventID, "wordlog", log_info_3);
        idfxString += new_xml_3;
        EventID += 1;

        // fourth batch
        let log_info_4 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_4 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_4
        );
        idfxString += new_xml_4;

        AddID < -AddID + 2;
      } else if ((Activity == "Paste") & (paramKey != "VK_V")) {
        let pasted = TextChangeN;
        let docLength_prior = docLength - pasted;
        let startPosition = paramPosition - pasted;
        let endPosition = paramPosition;

        // first batch
        let log_info_1 = {
          position: startPosition,
          documentLength: docLength_prior,
          replay: "False",
        };
        let new_xml_1 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_1
        );

        // second batch
        let log_info_2 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };

        let new_xml_2 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_2
        );

        // Merge batch 1 and batch 2
        let mergedxmlString = xmlMerge(new_xml_1, new_xml_2);
        idfxString += mergedxmlString;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: endPosition,
          before: TextChange,
          after: "NoValue",
        };
        let new_xml_3 = keylogConvert("insert", EventID, "wordlog", log_info_3);
        idfxString += new_xml_3;
        EventID += 1;

        // fourth batch
        let log_info_4 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_4 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_4
        );
        idfxString += new_xml_4;

        AddID < -AddID + 2;
      } else if ((Activity == "Replace") & (paramKey == "VK_V")) {
        const TextChange_split = TextChange.split(" => ");
        const before = TextChange_split[0];
        const after = TextChange_split[1];
        const beforeN = before.length;
        const afterN = after.length;

        let startPosition = paramPosition - afterN;
        let endPosition = paramPosition - afterN + beforeN;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: before,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // Second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: startPosition,
          documentLength: docLength,
          replay: "False",
        };
        let new_xml_3 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_3
        );

        // fourth batch
        if (after.toUpperCase != "V") {
          let log_info_4 = {
            startTime: start,
            endTime: end,
            key: "VK_LCONTROL",
            value: "NoValue",
            keyboardstate: "NoValue",
          };
          let new_xml_4 = keylogConvert(
            "keyboard",
            EventID,
            "winlog",
            log_info_4
          );
          // Merge batch 3 and batch 4
          let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
          idfxString += mergedxmlString;
          EventID += 1;
        } else {
          let log_info_4 = {
            startTime: start,
            endTime: end,
            key: paramKey,
            value: "NoValue",
            keyboardstate: "NoValue",
          };

          if (paramValue != "unrecognized") {
            log_info_4["value"] = after;
          }
          let new_xml_4 = keylogConvert(
            "keyboard",
            EventID,
            "winlog",
            log_info_4
          );
          // Merge batch 3 and batch 4
          let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
          idfxString += mergedxmlString;
          EventID += 1;
        }

        // fifth batch
        let log_info_5 = {
          position: startPosition,
          documentLength: docLength,
          replay: "False",
        };
        let new_xml_5 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_5
        );

        // Sixth batch
        let log_info_6 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "<key>VK_LCONTROL</key>",
        };

        let new_xml_6 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_6
        );

        // Merge batch 5 and batch 6
        let mergedxmlString = xmlMerge(new_xml_5, new_xml_6);
        idfxString += mergedxmlString;
        EventID += 1;

        // seventh batch
        let log_info_7 = {
          start: startPosition,
          end: endPosition,
          newtext: after,
        };
        let new_xml_7 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_7
        );
        idfxString += new_xml_7;
        EventID += 1;

        // eight batch
        let log_info_8 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_8 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_8
        );
        idfxString += new_xml_8;

        AddID < -AddID + 5;
      } else if ((Activity == "Replace") & (paramKey != "VK_V")) {
        const TextChange_split = TextChange.split(" => ");
        const before = TextChange_split[0];
        const after = TextChange_split[1];
        const beforeN = before.length;
        const afterN = after.length;

        let startPosition = paramPosition - afterN;
        let endPosition = paramPosition - afterN + beforeN;

        // first batch
        let log_info_1 = {
          start: startPosition,
          end: endPosition,
          newtext: before,
        };
        let new_xml_1 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_1
        );
        idfxString += new_xml_1;
        EventID += 1;

        // Second batch
        let log_info_2 = {
          start: startPosition,
          end: endPosition,
        };
        let new_xml_2 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_2
        );
        idfxString += new_xml_2;
        EventID += 1;

        // third batch
        let log_info_3 = {
          position: startPosition,
          documentLength: docLength,
          replay: "False",
        };
        let new_xml_3 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_3
        );
        // fourth batch
        let log_info_4 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };

        if (paramValue != "unrecognized") {
          log_info_4["value"] = after;
        }
        let new_xml_4 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_4
        );
        // Merge batch 3 and batch 4
        let mergedxmlString = xmlMerge(new_xml_3, new_xml_4);
        idfxString += mergedxmlString;
        EventID += 1;

        // fifth batch
        let log_info_5 = {
          start: startPosition,
          end: endPosition,
          newtext: after,
        };
        let new_xml_5 = keylogConvert(
          "replacement",
          EventID,
          "wordlog",
          log_info_5
        );
        idfxString += new_xml_5;
        EventID += 1;

        // sixth batch
        let log_info_6 = {
          start: endPosition,
          end: endPosition,
        };
        let new_xml_6 = keylogConvert(
          "selection",
          EventID,
          "wordlog",
          log_info_6
        );
        idfxString += new_xml_6;

        AddID < -AddID + 4;
      } else if (DownValue == "Enter") {
        // first batch
        let log_info_1 = {
          position: paramPosition,
          documentLength: docLength,
          replay: "True",
        };
        let new_xml_1 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_1
        );

        // second batch
        let log_info_2 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };
        let new_xml_2 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_2
        );
        // Merge batch 1 and batch 2
        let mergedxmlString = xmlMerge(new_xml_1, new_xml_2);
        idfxString += mergedxmlString;
      } else {
        // first batch
        let log_info_1 = {
          position: paramPosition,
          documentLength: docLength,
          replay: "True",
        };
        let new_xml_1 = keylogConvert(
          "keyboard",
          EventID,
          "wordlog",
          log_info_1
        );
        // second batch
        let log_info_2 = {
          startTime: start,
          endTime: end,
          key: paramKey,
          value: "NoValue",
          keyboardstate: "NoValue",
        };

        if (paramValue != "unrecognized") {
          log_info_2["value"] = paramValue;
        }
        let new_xml_2 = keylogConvert(
          "keyboard",
          EventID,
          "winlog",
          log_info_2
        );
        // Merge batch 1 and batch 2
        let mergedxmlString = xmlMerge(new_xml_1, new_xml_2);
        idfxString += mergedxmlString;
      }
    }
  }

  idfxString += "\n</log> ";
  return idfxString;
}
