# Keystroke Logging Using FlexKeyLogger (ReactJS Version)

This repository contains a **demo ReactJS web application** that
illustrates the use of **FlexKeyLogger**, a web-based keystroke logging
program developed for **research and development purposes**.

FlexKeyLogger records fine-grained writing process data---keystrokes,
mouse actions, cursor movements, timing information, and text
changes---in real time. The demo app shows how FlexKeyLogger can be
embedded into a React application with minimal effort.

------------------------------------------------------------------------

## Overview of FlexKeyLogger

FlexKeyLogger is implemented in **JavaScript** and encapsulated within a
**custom React hook**. This design allows developers and researchers to
seamlessly integrate keystroke logging into:

-   ReactJS-based webpages and applications\
-   Writing tasks and surveys\
-   Educational technology systems\
-   Chatbots and intelligent tutoring systems

FlexKeyLogger runs unobtrusively in the background and logs:

-   Keyboard events (e.g., input, backspace, delete)
-   Mouse and touch events
-   Event timing (milliseconds since task onset)
-   Cursor positions
-   Text changes (insertions, deletions, replacements, pastes, moves)
-   Higher-level activity types (e.g., Input, Remove/Cut, Paste,
    Replace)

All logging is confined to the target text area; interactions outside
the text area are not recorded.

------------------------------------------------------------------------

## Keystroke Data Output

FlexKeyLogger produces structured keystroke data suitable for downstream
analysis of writing processes.

Key fields include:

-   **EventID**: Sequential index of keyboard and mouse events\
-   **EventTime**: Time (ms) since task onset\
-   **Output**: Key pressed or mouse action\
-   **CursorPosition**: Cursor position after the event\
-   **TextChange**: Exact text change caused by the event\
-   **Activity**: Classified operation type

### Example Output

  ----------------------------------------------------------------------------------------
    EventID   EventTime Output         CursorPosition TextChange   Activity
  --------- ----------- ----------- ----------------- ------------ -----------------------
          1        6370 Leftclick                   0 NoChange     Nonproduction

          3        8150 T                           1 T            Input

         14       15145 v                           7 is           Paste

         20       24628 Backspace                  11 o            Remove/Cut

         23       29792 w                           9 good =\> w   Replace

         36       37083 Leftclick                  10 a =\> o      AutoCorrectionReplace

         38       43028 Leftclick                  11 fun          Move From \[18, 21\] To
                                                                   \[8, 11\]
  ----------------------------------------------------------------------------------------

------------------------------------------------------------------------

## Running the Demo App

### Prerequisites

-   Node.js (version 16 or later recommended)
-   npm (comes with Node.js)

### Steps

1.  Install dependencies:

    ``` bash
    npm install
    ```

2.  Start the development server:

    ``` bash
    npm run dev
    ```

3.  Open the local URL shown in the terminal (typically
    `http://localhost:5173`).

4.  Follow the on-screen instructions to type text and inspect the
    keystroke data.

------------------------------------------------------------------------

## Adapting FlexKeyLogger to Your Own React App

FlexKeyLogger is designed to be **plug-and-play** for React
applications.

### Step 1: Import the hook

Copy `FlexKeyLogger.jsx` (and its dependencies such as
`ActivityDetector.jsx`) into your project, then import the hook:

``` js
import { useFlexKeyLogger } from "./FlexKeyLogger";
```

------------------------------------------------------------------------

### Step 2: Create refs for UI elements

FlexKeyLogger attaches event listeners via React refs:

``` js
import { useRef } from "react";

const textAreaRef = useRef(null);
const submitButtonRef = useRef(null);
```

Optional refs (only needed if you support exporting/downloading data):

``` js
const downloadcsvRef = useRef(null);
const downloadidfxRef = useRef(null);
const downloadtextRef = useRef(null);
```

------------------------------------------------------------------------

### Step 3: Call `useFlexKeyLogger`

Invoke the hook inside your component:

``` js
useFlexKeyLogger({
  textAreaRef,
  submitButtonRef,
  downloadcsvRef,
  downloadidfxRef,
  downloadtextRef,
});
```

This automatically attaches event listeners when the component mounts
and cleans them up when the component unmounts.

------------------------------------------------------------------------

### Step 4: Attach refs to JSX elements

Bind the refs to your JSX:

``` jsx
<textarea
  ref={textAreaRef}
  spellCheck="false"
  placeholder="Enter your text here"
/>

<button ref={submitButtonRef}>
  Done
</button>
```

FlexKeyLogger will begin logging as soon as the user interacts with the
textarea.

------------------------------------------------------------------------

### Step 5: Customize behavior (optional)

You can adapt FlexKeyLogger to your needs by:

-   Replacing the **Done** button with a timer or form submission
-   Sending keystroke data to a backend instead of downloading files
-   Extending logging to additional event types

------------------------------------------------------------------------

## Design Philosophy

FlexKeyLogger is designed to be:

-   **Non-intrusive**
-   **High-resolution**
-   **React lifecycle--aware**
-   **Research-oriented**

------------------------------------------------------------------------

## Intended Use Cases

FlexKeyLogger is suitable for:

-   Writing process research
-   Educational technology experiments
-   Automated writing feedback systems
-   Human--AI interaction studies
-   Learning analytics pipelines

------------------------------------------------------------------------

## Summary

This demo illustrates how FlexKeyLogger can be embedded into a ReactJS
application with minimal setup. By leveraging React hooks and refs,
FlexKeyLogger provides a flexible and extensible solution for capturing
detailed writing process data in modern web applications.
