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

FFlexKeyLogger is implemented in JavaScript and encapsulated within React hooks. This design allows users to seamlessly incorporate it into ReactJS-based webpages (as illustrated in this demo webpage) or applications, such as chatbots. FlexKeyLogger operates unobtrusively in the background, recording every keystroke and mouse activity along with relevant timing and cursor position information. Additionally, it identifies operation types (e.g., input, delete, paste, replace) and captures text changes during text production in real-time.

In the output of keystroke data, as shown below, _Event ID_ indexes the keyboard and mouse operations in chronological order. _EventTime_ denotes the time (in milliseconds) when a key or the mouse was pressed. _Output_ shows the content of the keystroke or mouse event. _Cursor Position_ registers cursor position information to help keep track of the location of the leading edge. Additionally, _Text Change_ shows the exact changes made to the current text while _Activity_ indicates the nature of the changes (e.g., Input, Remove/Cut).

| Event ID | Event Time | Output    | Cursor Position | Text Change | Activity                      |
| -------- | ---------- | --------- | --------------- | ----------- | ----------------------------- |
| 1        | 6370       | Leftclick | 0               | NoChange    | Nonproduction                 |
| 2        | 7897       | CapsLock  | 0               | NoChange    | Nonproduction                 |
| 3        | 8150       | T         | 1               | T           | Input                         |
| 4        | 8310       | CapsLock  | 1               | NoChange    | Nonproduction                 |
| 5        | 8470       | h         | 2               | h           | Input                         |
| 6        | 8855       | i         | 3               | i           | Input                         |
| 7        | 8993       | s         | 4               | s           | Input                         |
| 8        | 10971      | Leftclick | 4               | NoChange    | Nonproduction                 |
| 9        | 12991      | Control   | 4               | NoChange    | Nonproduction                 |
| 10       | 13174      | c         | 4               | NoChange    | Nonproduction                 |
| 11       | 13750      | Leftclick | 4               | NoChange    | Nonproduction                 |
| 12       | 14367      | Space     | 5               |             | Input                         |
| 13       | 14873      | Control   | 5               | NoChange    | Nonproduction                 |
| 14       | 15145      | v         | 7               | is          | Paste                         |
| 15       | 18476      | Space     | 8               |             | Input                         |
| 16       | 19623      | g         | 9               | g           | Input                         |
| 17       | 21750      | o         | 10              | o           | Input                         |
| 18       | 21931      | o         | 11              | o           | Input                         |
| 19       | 22638      | o         | 12              | o           | Input                         |
| 20       | 24628      | Backspace | 11              | o           | Remove/Cut                    |
| 21       | 25023      | d         | 12              | d           | Input                         |
| 22       | 27387      | Leftclick | 12              | NoChange    | Nonproduction                 |
| 23       | 29792      | w         | 9               | good => w   | Replace                       |
| 24       | 30364      | a         | 10              | a           | Input                         |
| 25       | 30567      | n         | 11              | n           | Input                         |
| 26       | 30678      | d         | 12              | d           | Input                         |
| 27       | 30913      | e         | 13              | e           | Input                         |
| 28       | 30992      | r         | 14              | r           | Input                         |
| 29       | 31607      | f         | 15              | f           | Input                         |
| 30       | 31771      | u         | 16              | u           | Input                         |
| 31       | 31967      | l         | 17              | l           | Input                         |
| 32       | 34528      | Space     | 18              |             | Input                         |
| 33       | 34848      | f         | 19              | f           | Input                         |
| 34       | 35111      | u         | 20              | u           | Input                         |
| 35       | 35445      | n         | 21              | n           | Input                         |
| 36       | 37083      | Leftclick | 10              | a => o      | AutoCorrectionReplace         |
| 37       | 40818      | Leftclick | 21              | NoChange    | Nonproduction                 |
| 38       | 43028      | Leftclick | 11              | fun         | Move From [18, 21] To [8, 11] |
| 39       | 45804      | Leftclick | 11              | NoChange    | Nonproduction                 |
| 40       | 47336      | Space     | 12              |             | Input                         |
| 41       | 52496      | a         | 13              | a           | Input                         |
| 42       | 52730      | n         | 14              | n           | Input                         |
| 43       | 52873      | d         | 15              | d           | Input                         |
| 44       | 53872      | Space     | 16              |             | Input                         |
| 45       | 56062      | Leftclick | 26              | NoChange    | Nonproduction                 |
| 46       | 58137      | Backspace | 25              |             | Remove/Cut                    |
| 47       | 59421      | Shift     | 25              | NoChange    | Nonproduction                 |
| 48       | 59634      | !         | 26              | !           | Input                         |

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
