## Keystroke Logging Using FlexKeyLogger

This is a simple demo website to illustrate the use of FlexKeyLogger, a web-based keystroke logging program, to collect keystroke data for research and development purposes.

FlexKeyLogger is implemented in JavaScript and encapsulated within React hooks. This design allows users to seamlessly incorporate it into ReactJS-based webpages (as illustrated in this demo webpage) or applications, such as chatbots. FlexKeyLogger operates unobtrusively in the background, recording every keystroke and mouse activity along with relevant timing and cursor position information. Additionally, it identifies operation types (e.g., input, delete, paste, replace) and captures text changes during text production in real-time.

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

#### To run this app:

1. First, run `npm install` to install the required dependencies (Make sure you have [Node.js](https://nodejs.org/en) installed on your computer first).
2. Then, run the command: `npm run dev` to host the webpage locally.
3. Follow the instructions on the webpage to try out the keystroke logging program and check the data. Have fun!
