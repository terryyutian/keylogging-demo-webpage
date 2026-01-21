# FlexKeyLogger (Vanilla JavaScript Integration)

This document explains how to use **`attachFlexKeyLogger.js`** to
collect keystroke logging data in a web application built with **vanilla
JavaScript** (no React, no framework, no file downloads).

The logger attaches to a `<textarea>`, records detailed keystroke and
editing activities in memory, and allows you to retrieve the data
programmatically (e.g., for sending to a backend server).

------------------------------------------------------------------------

## What this version does (and does NOT do)

**This vanilla-JS version:** - Collects keystroke, cursor, and
text-editing data - Classifies activities using `ActivityDetector` -
Stores all data in memory - Exposes a clean API to retrieve the log

**This version does NOT:** - Generate CSV or IDFX files - Trigger
downloads - Depend on React, JSX, or a build step

------------------------------------------------------------------------

## Requirements

-   A modern browser that supports **ES modules**
-   A `<textarea>` element in your page
-   (Optional but recommended) a "Done" or "Submit" button to finalize
    logging

------------------------------------------------------------------------

## File structure

    your-app/
    ├── index.html
    ├── main.js
    └── src/
        ├── attachFlexKeyLogger.js
        └── ActivityDetector.js

> **Important** - All imported files must use the `.js` extension. -
> Browsers do **not** support `.jsx` files without a build step. -
> `ActivityDetector` contains plain JavaScript and should be named
> `ActivityDetector.js`.

------------------------------------------------------------------------

## 1. HTML setup

``` html
<textarea
  id="writer"
  spellcheck="false"
  placeholder="Type your text here..."
></textarea>

<button id="done">Done</button>

<script type="module" src="./main.js"></script>
```

------------------------------------------------------------------------

## 2. JavaScript setup

``` js
import { attachFlexKeyLogger } from "./src/attachFlexKeyLogger.js";

const textarea = document.getElementById("writer");
const doneBtn = document.getElementById("done");

const logger = attachFlexKeyLogger({
  textarea,
  submitBtn: doneBtn,
});
```

------------------------------------------------------------------------

## 3. Finalizing and accessing the data

``` js
doneBtn.addEventListener("click", () => {
  const keylog = logger.getKeylog();
  console.log(keylog);
});
```

------------------------------------------------------------------------

## 4. Programmatic finalize (no button required)

``` js
const logger = attachFlexKeyLogger({ textarea });

setTimeout(() => {
  logger.finalize();
  const keylog = logger.getKeylog();
  console.log(keylog);
}, 5 * 60 * 1000);
```

------------------------------------------------------------------------

## 5. Sending data to a server

``` js
await fetch("/api/keystrokes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(logger.getKeylog()),
});
```

------------------------------------------------------------------------

## 6. Detaching the logger

``` js
logger.detach();
```

------------------------------------------------------------------------

## Minimal working example

**index.html**

``` html
<!doctype html>
<html>
  <body>
    <textarea id="writer" spellcheck="false"></textarea>
    <button id="done">Done</button>

    <script type="module" src="./main.js"></script>
  </body>
</html>
```

**main.js**

``` js
import { attachFlexKeyLogger } from "./src/attachFlexKeyLogger.js";

const textarea = document.getElementById("writer");
const doneBtn = document.getElementById("done");

const logger = attachFlexKeyLogger({ textarea, submitBtn: doneBtn });

doneBtn.addEventListener("click", () => {
  console.log(logger.getKeylog());
});
```

------------------------------------------------------------------------

## Summary

-   Framework-free, browser-native keystroke logger
-   Attaches to a standard `<textarea>`
-   Data accessed programmatically via `getKeylog()`
-   No React, no JSX, no build step required
