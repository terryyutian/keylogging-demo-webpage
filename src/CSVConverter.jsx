// src/CSVConverter.jsx

export function CSVConverter(keylog) {
  if (!keylog || typeof keylog !== "object") {
    console.error("CSVConverter error: keylog is missing or invalid");
    return "";
  }

  // Extract only the core arrays we want exported
  const original = {
    EventID: keylog.EventID || [],
    EventTime: keylog.EventTime || [],
    Output: keylog.Output || [],
    CursorPosition: keylog.CursorPosition || [],
    TextChange: keylog.TextChange || [],
    Activity: keylog.Activity || [],
  };

  // Determine max row count
  const maxLen = Math.max(
    original.EventID.length,
    original.EventTime.length,
    original.Output.length,
    original.CursorPosition.length,
    original.TextChange.length,
    original.Activity.length
  );

  // Normalize all arrays to maxLen (copying to avoid mutating original)
  const normalize = (arr) => {
    const copy = [...arr];
    while (copy.length < maxLen) copy.push("");
    return copy;
  };

  const data = {
    EventID: normalize(original.EventID),
    EventTime: normalize(original.EventTime),
    Output: normalize(original.Output),
    CursorPosition: normalize(original.CursorPosition),
    TextChange: normalize(original.TextChange),
    Activity: normalize(original.Activity),
  };

  const headers = Object.keys(data);

  // Helper for proper CSV escaping
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // Needs quotes if contains comma, quote, or newline
    if (/[",\n]/.test(str)) {
      // Escape internal quotes by doubling them
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [];
  rows.push(headers.join(",")); // header row

  for (let i = 0; i < maxLen; i++) {
    const row = headers.map((header) => escapeCSV(data[header][i]));
    rows.push(row.join(","));
  }

  return rows.join("\n");
}
