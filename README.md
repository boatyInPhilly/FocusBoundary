# focus-boundary

A React component for managing focus within a boundary.

## Install

```sh
npm install focus-boundary
```

## Usage

```tsx
import { FocusBoundary } from 'focus-boundary';

<FocusBoundary onFocusEnter={() => {}} onFocusLeave={() => {}}>
  <input />
</FocusBoundary>;
```

## Development

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Serve the example app in `example/`            |
| `npm test`          | Run tests in watch mode                        |
| `npm run test:run`  | Run tests once                                 |
| `npm run typecheck` | Type-check `src`, `example` and `test`         |
| `npm run build`     | Build the library to `dist/` (only `src/`)     |

Layout:

- `src/`: the published library. `src/index.ts` is the package entry point.
- `example/`: demo app, imports straight from `src/`. Not published.
- `test/`: Vitest + Testing Library tests. Not published.
