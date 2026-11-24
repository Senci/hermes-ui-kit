# hermes-plugin-ui-kit

![hermes-plugin-ui-kit](https://raw.githubusercontent.com/Senci/hermes-ui-kit/main/docs/assets/cover.jpg)

Small UI helpers for Hermes Desktop plugins, for what the plugin SDK (`@hermes/plugin-sdk`) does not ship. Source only: a plugin installs it as a build dependency and esbuild bundles the modules it imports into `desktop/plugin.js`. The desktop loader admits only `@hermes/plugin-sdk` and `react*` imports at runtime, so nothing here is resolved on the user's machine.

React and the SDK stay external in the bundle (the host injects them). The modules use plain `createElement`, no JSX, and have no dependencies of their own.

```sh
npm install --save-dev hermes-plugin-ui-kit
```

```js
import { useBackend, useLiveQuery } from 'hermes-plugin-ui-kit/live.js'
import { mountStyle } from 'hermes-plugin-ui-kit/theme.js'
```

## Modules

| Module | Exports | What it is |
|---|---|---|
| `theme.js` | `ui`, `TONE`, `muted`, `mountStyle` | Theme bridge. Colours are the host's `var(--ui-*)` properties, never resolved values. `mountStyle(id, css)` adds a plugin stylesheet and returns its remover. |
| `live.js` | `useLiveQuery`, `startLiveChannel`, `useBackend`, `POLL_FLOOR_MS`, `LIVE_SAFETY_MS` | Live data. Polling is the floor (15 s off-socket); a live socket only stretches the interval. Connection and profile belong in every query key. |
| `table.js` | `Table`, `cell` | A table on SDK primitives (the SDK has none), with an empty state. |
| `route.js` | `createRoute(path, { select, params })` | Hash-route state for drill-down and deep links: `read`, `write` (replaceState), `on`, `href`. |
| `gated.js` | `GatedActionButton` | A button that opens the SDK `ConfirmDialog`; only the dialog's confirm runs `onConfirm`. It never submits chat text. |
| `shell.js` | `Shell`, `Stage`, `Bar`, `FootBar` | Page layout: focusable page, pan and zoom stage, toolbar on top, footer below. |
| `viewport.js` | `useViewport` | Pan and zoom camera, DOM-direct so a drag never re-renders. |
| `css.js` | `graphCss(prefix, animMs, extra)` | A graph-page stylesheet, one class prefix per plugin. |
| `layered.js` | `dagPlace`, `dagBoard`, `dagReduce`, `dagPorts`, `dagEdge`, ... | Layered DAG layout. Pure, no imports. Card size is passed as `{ NW, NH }`. |
| `util.js` | `walk`, `useDebounced`, `stopEvent` | Small helpers. |

`index.js` re-exports everything.

## Rules

- No import other than `@hermes/plugin-sdk` and `react`. `layered.js` imports nothing.
- Every SDK name a module imports must exist in the oldest supported Hermes. `npm run check` compares them with `scripts/sdk-floor-exports.txt` (the value exports of the floor release); a missing export is a link-time error that drops the whole plugin without a log line.
- No `composer.submit`. Data-sourced text must never reach a chat submit.

## Release

`npm run check`, bump `version`, tag `vX.Y.Z`, `npm publish`.
