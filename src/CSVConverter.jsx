export function CSVConverter(keylog) {
  console.log("fire!!!!!!");
  if (!keylog) {
    console.error("Error: keylog is undefined or null");
    return "";
  } else {
    const keylog_core = {
      EventID: keylog.EventID,
      EventTime: keylog.EventTime,
      Output: keylog.Output,
      CursorPosition: keylog.CursorPosition,
      TextChange: keylog.TextChange,
      Activity: keylog.Activity,
    };

    // Ensure all arrays have the same length
    const maxArrayLength = Math.max(
      keylog_core.EventID.length,
      keylog_core.EventTime.length,
      keylog_core.Output.length,
      keylog_core.CursorPosition.length,
      keylog_core.TextChange.length,
      keylog_core.Activity.length
    );

    // Pad arrays with undefined values to make them of the same length
    const normalizeArrayLength = (arr, length) => {
      while (arr.length < length) {
        arr.push(undefined); // or any default value you want
      }
    };

    normalizeArrayLength(keylog_core.EventID, maxArrayLength);
    normalizeArrayLength(keylog_core.EventTime, maxArrayLength);
    normalizeArrayLength(keylog_core.Output, maxArrayLength);
    normalizeArrayLength(keylog_core.CursorPosition, maxArrayLength);
    normalizeArrayLength(keylog_core.TextChange, maxArrayLength);
    normalizeArrayLength(keylog_core.Activity, maxArrayLength);
    const headers = Object.keys(keylog_core);
    const csvRows = [headers.join(",")];

    // Create CSV rows
    for (let i = 0; i < maxArrayLength; i++) {
      const row = headers.map((header) => {
        // Handle values containing commas by enclosing them in double quotes
        const value = keylog[header][i];
        return typeof value === "string" &&
          (value.includes(",") || value.includes("\n"))
          ? `"${value}"`
          : value;
      });
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  }
}
