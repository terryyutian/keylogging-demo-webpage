// taskonset: the time when the question is loaded.
// event time in keystroke logs: keep them as the time point from Unix time.

import { useEffect } from "react";

import { ActivityDetector } from "./ActivityDetector";

import { CSVConverter } from "./CSVConverter";

import { IDFXConverter } from "./IDFXConverter";

export function useFlexKeyLogger({
  textAreaRef,
  submitButtonRef,
  downloadcsvRef,
  downloadidfxRef,
  downloadtextRef,
  // Other parameters for the key stroke logger...
}) {
  useEffect(() => {
    const c_textAreaRef = textAreaRef.current;
    const c_submitButtonRef = submitButtonRef.current;
    const c_downloadcsvRef = downloadcsvRef.current;
    const c_downloadidfxRef = downloadidfxRef.current;
    const c_downloadtextRef = downloadtextRef.current;
    let TextareaTouch = false;
    let currentTime = new Date();
    let taskonset = currentTime.getTime(); // set the value as the time when the target question is loaded.
    let EventID = 0;
    let startSelect = [];
    let endSelect = [];
    let ActivityCancel = []; // to keep track of changes caused by control + z
    let TextChangeCancel = []; // to keep track of changes caused by control + z
    let keylog = {
      //Proprieties
      TaskOnSet: [], ///
      TaskEnd: [],
      EventID: [], ////
      EventTime: [], ////
      Output: [], ////
      CursorPosition: [], ////
      TextContent: [], ////
      TextChange: [], ////
      Activity: [], /////
      FinalProduct: [], /////
    };

    const handleCursor = (keylog, startSelect, endSelect) => {
      // log cursor position information
      keylog.CursorPosition.push(c_textAreaRef.selectionEnd);
      startSelect.push(c_textAreaRef.selectionStart);
      endSelect.push(c_textAreaRef.selectionEnd);
    };

    const logCurrentText = (e) => {
      keylog.TextContent.push(e.target.value);
    };

    const handleKeyDown = (e) => {
      let d_press = new Date();
      keylog.EventTime.push(d_press.getTime() - taskonset); // start time

      EventID = EventID + 1;
      keylog.EventID.push(EventID);

      /// when logging space, it is better to use the letter space for the output column
      if (e.key === " ") {
        keylog.Output.push("Space");
      } else if (e.key === "Unidentified") {
        keylog.Output.push("VirtualKeyboardTouch");
      } else {
        keylog.Output.push(e.key);
      }

      logCurrentText(e);
      handleCursor(keylog, startSelect, endSelect);

      // use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );
      // console.log(textNow);
      console.log(keylog.TextChange.slice(-1));
      console.log(String(keylog.TextChange.slice(-1)).length);
    };

    const handleTouch = () => {
      TextareaTouch = true;
    };

    const handleMouseClick = (e) => {
      let mouseDown_m = new Date();
      let MouseDownTime = mouseDown_m.getTime() - taskonset;

      EventID = EventID + 1;
      keylog.EventID.push(EventID);

      //////Start logging for this current click down event
      keylog.EventTime.push(MouseDownTime); // starttime
      if (e.button === 0) {
        if (TextareaTouch) {
          keylog.Output.push("TextareaTouch");
        } else {
          keylog.Output.push("Leftclick");
        }
      } else if (e.button === 1) {
        if (TextareaTouch) {
          keylog.Output.push("TextareaTouch");
        } else {
          keylog.Output.push("Middleclick");
        }
      } else if (e.button === 2) {
        if (TextareaTouch) {
          keylog.Output.push("TextareaTouch");
        } else {
          keylog.Output.push("Rightclick");
        }
      } else {
        if (TextareaTouch) {
          keylog.Output.push("TextareaTouch");
        } else {
          keylog.Output.push("Unknownclick");
        }
      }

      logCurrentText(e);
      // log cursor position
      handleCursor(keylog, startSelect, endSelect);
      /////// use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );

      // set TextareaTouch back as False;
      TextareaTouch = false;
    };

    const handleSubmit = (e) => {
      e.preventDefault(); // to prevent a browser refresh or reload
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
        //post the data to the serve
      } else {
        console.log("submit with a instanitated object");
        keylog.TaskOnSet.push(taskonset); //record task onset time

        ///// adjust the keylog data
        // record current text
        keylog.TextContent.push(String(c_textAreaRef.value));
        // record the final product
        keylog.FinalProduct = String(keylog.TextContent.slice(-1));

        // log cursor position
        handleCursor(keylog, startSelect, endSelect);
        /////// use a customized function to detect and record different activities and the according text changes these activities bring about
        ActivityDetector(
          keylog,
          startSelect,
          endSelect,
          ActivityCancel,
          TextChangeCancel
        );

        //Textchange and Activity adjustment
        keylog.TextChange.shift();
        keylog.Activity.shift();

        // cursor information adjustment
        keylog.CursorPosition.shift();

        let d_end = new Date();
        let taskend = d_end.getTime();
        keylog.TaskEnd.push(taskend); //record task end time
      }
      // //Turn the keylog object into json
      // let keylog_json = JSON.stringify(
      //   {
      //     EventID: keylog.EventID.join(),
      //     EventTime: keylog.EventTime.join(),
      //     Output: keylog.Output.join("<=@=>"),
      //     CursorPosition: keylog.CursorPosition.join(),
      //     TextChange: keylog.TextChange.join("<=@=>"),
      //     Activity: keylog.Activity.join("<=@=>"),
      //     FinalProduct: keylog.FinalProduct,
      //   },
      //   null,
      //   2
      // );
      // // Create a Blob and create a download link
      // const blob = new Blob([keylog_json], { type: "application/json" });
      // const a = document.createElement("a");
      // a.href = URL.createObjectURL(blob);
      // a.download = "user_data.json";
      // document.body.appendChild(a);
      // a.click();

      // // Clean up
      // document.body.removeChild(a);
    };

    const downloadCSV = (keylog) => {
      // concert keylog object into a csv
      const keylog_csv = CSVConverter(keylog);

      //get the date info as the file name
      const currentDate = new Date();
      const filename = `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getDate()}.csv`;

      // Create a Blob and create a download link
      const blob = new Blob([keylog_csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
    };

    const downloadIDFX = (keylog) => {
      // concert keylog object into a csv
      const keylog_idfx = IDFXConverter(keylog);

      //get the date info as the file name
      const currentDate = new Date();
      const filename = `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getDate()}.idfx`;

      // Create a Blob and create a download link
      const blob = new Blob([keylog_idfx], { type: "application/xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
    };

    const downloadText = (keylog) => {
      // concert keylog object into a csv
      const keylog_text = String(keylog.FinalProduct);

      //get the date info as the file name
      const currentDate = new Date();
      const filename = `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getDate()}.txt`;

      // Create a Blob and create a download link
      const blob = new Blob([keylog_text], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
    };

    const handleDownloadCSV = (e) => {
      e.preventDefault();
      downloadCSV(keylog);
    };

    const handleDownloadIDFX = (e) => {
      e.preventDefault();
      downloadIDFX(keylog);
    };

    const handleDownloadTEXT = (e) => {
      e.preventDefault();
      downloadText(keylog);
    };

    const isInput = c_textAreaRef && c_textAreaRef.tagName === "TEXTAREA";
    const isButton =
      c_submitButtonRef && c_submitButtonRef.tagName === "BUTTON";
    //const formElement = currentRef?.closest("form");
    const isDownloadCSV =
      c_downloadcsvRef && c_downloadcsvRef.tagName === "BUTTON";
    const isDownloadIDFX =
      c_downloadidfxRef && c_downloadidfxRef.tagName === "BUTTON";
    const isDownloadTEXT =
      c_downloadtextRef && c_downloadtextRef.tagName === "BUTTON";

    if (isInput) {
      c_textAreaRef.addEventListener("keydown", (e) => {
        handleKeyDown(e);
      });

      // for touch screen devices, event listener needs to be added to the whole document.
      c_textAreaRef.addEventListener("touchstart", handleTouch);

      c_textAreaRef.addEventListener("mousedown", handleMouseClick);
    }

    if (isButton) {
      c_submitButtonRef.addEventListener("click", handleSubmit);
    }

    if (isDownloadCSV) {
      c_downloadcsvRef.addEventListener("click", handleDownloadCSV);
    }

    if (isDownloadIDFX) {
      c_downloadidfxRef.addEventListener("click", handleDownloadIDFX);
    }

    if (isDownloadTEXT) {
      c_downloadtextRef.addEventListener("click", handleDownloadTEXT);
    }

    // Remove the current event listeners. They do not automatically disappear with new rerenderings.

    return () => {
      if (isInput) {
        c_textAreaRef.removeEventListener("keydown", (e) => {
          handleKeyDown(e);
        });

        // for touch screen devices, event listener needs to be added to the whole document.
        c_textAreaRef.removeEventListener("touchstart", handleTouch);
        c_textAreaRef.removeEventListener("mousedown", handleMouseClick);
      }

      if (isButton) {
        c_submitButtonRef.removeEventListener("click", handleSubmit);
      }

      if (isDownloadCSV) {
        c_downloadcsvRef.removeEventListener("click", handleDownloadCSV);
      }

      if (isDownloadIDFX) {
        c_downloadidfxRef.removeEventListener("click", handleDownloadIDFX);
      }

      if (isDownloadTEXT) {
        c_downloadtextRef.removeEventListener("click", handleDownloadTEXT);
      }
    };
  }, [
    textAreaRef,
    submitButtonRef,
    downloadcsvRef,
    downloadidfxRef,
    downloadtextRef,
  ]);
}
