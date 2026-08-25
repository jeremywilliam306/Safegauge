# SafeGauge Portal — take-home submission

## Running it
ensure npm is installed with the latest version
npm install
npm run dev   → http://localhost:5173

Demo accounts:
- admin / safegauge (has full access)
- viewer / readonly (read-only)

## What's done
- Auth: login form with inline error on bad credentials, logout, global 401 handling (apiClient.js wraps every Api call so a dead token anywhere in the app routes back to login automatically).
- Devices: list, create (with inline 422 field errors), delete. Edit is not yet built.
- Under create new DeviceList, entries appear without re-fetching the whole list
- in api.Client.js, it wraps all the 5 operations however ive only done list/create/delete hooked to the screen

## What's not done yet
- remember me checkbox - always logs in when its checked. Have not toggled them just yet
- Devices: edit
- Alert rules 
- Live dashboard (have not touched them yet) 
- Tests
- No delete confirmation listed as the device would be instantly removed once clicked
- have not specifically verified the viewer/readonly against Devices screens

## Trade-offs / known issues

- Refreshing the page would log you out, but to keep someone logged in after a refresh (save the session, re-check it with the API when the page loads). Reading mock-api.js's actual source, it never saves login tokens anywhere permanent, so I made every token becoming invalid the instant the page reloads

- The DeviceForm just sends whatever's typed and lets the server say what's wrong (empty name, sensor count out of range, etc.), then shows those errors. I didn't duplicate that checking logic in the browser too.

- No delete confirmations yet, even though deleting a device also deletes the alert rules.

- When new devices are created, i add them straight to the exisiting list in memory, not through calling the list endpoint. But if 2 users are viewing them together, they could end up seeing different variable lists.

- The docs mentioned about having the `firmwareVersion` in devices, but i didnt place them in and left it out of my UI. It would normally tell you what version of soft is running.

## On using AI

I Used Claude as a coding tutor, however, i wrote the codes myself. I used them mainly as a debugging partner and to explain React/JS concepts I was learning as I went (useState, useEffect, controlled inputs, promise handling). I wrote the code myself, Claude pointed out bugs (missing braces, typos, wrong import paths, mismatched variable names) and explained why they were wrong rather than just fixing them for me. I made lots of mistakes myself. I also used it to double check my work with the actual API docs. Tried to understand every mistake and things that I wasn't sure at along the way aswell.

