# focus-boundary

A React component that keeps keyboard focus inside a region while it's locked. Tab from the last focusable element wraps to the first, and Shift+Tab from the first wraps to the last. Useful for modals, drawers, popovers and menus.

## Install

```sh
npm install focus-boundary
```

Requires React 18 or 19 as a peer dependency. Its one dependency, [`tabbable`](https://github.com/focus-trap/tabbable), installs automatically.

## Usage

```tsx
import { useState } from 'react'
import { FocusBoundary } from 'focus-boundary'

export function Example() {
  const [isLocked, setIsLocked] = useState(false)

  return (
    <FocusBoundary isLocked={isLocked}>
      <button onClick={() => setIsLocked(!isLocked)}>
        {isLocked ? 'Unlock' : 'Lock'} focus
      </button>
      <input aria-label="Name" />
      <input aria-label="Email" />
    </FocusBoundary>
  )
}
```

## Props

`FocusBoundary` renders a `<div>` around its children.

| Prop       | Type                  | Default | Description                                                     |
| ---------- | --------------------- | ------- | --------------------------------------------------------------- |
| `isLocked` | `boolean`             | `false` | When `true`, Tab and Shift+Tab wrap within the boundary         |
| `ref`      | `Ref<HTMLDivElement>` |         | Forwarded to the wrapping `<div>`                               |
| `...rest`  | `<div>` props         |         | Passed to the wrapping `<div>` (`className`, `style`, `aria-*`) |

Focusable elements are found with `tabbable`, in the browser's real Tab order. Disabled, hidden, `inert` and `tabindex="-1"` elements are skipped, and a radio group counts as a single stop.

## What it doesn't do

`FocusBoundary` only handles Tab and Shift+Tab inside the boundary. The rest is up to you, so it fits whatever focus behavior your UI needs:

- **It doesn't move focus in when it locks.** If focus is outside the boundary, it stays there until you move it.
- **It doesn't return focus when it unlocks.** Focus the element that opened the boundary yourself.
- **It doesn't block the rest of the page.** Mouse clicks and screen readers can still reach content outside. Use `<dialog>` with `showModal()`, or the [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) attribute, for that.
- **It doesn't handle Escape.** Add your own key handler or close button.

## Recipe: modal dialog

A native `<dialog>` opened with `showModal()` blocks the rest of the page. `FocusBoundary` keeps Tab wrapping inside it rather than escaping to the browser's address bar. This example moves focus in on open and back to the trigger button on close:

```tsx
import { useRef, useState } from 'react'
import { FocusBoundary } from 'focus-boundary'

export function EditProfileDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const open = () => {
    dialogRef.current?.showModal()
    firstFieldRef.current?.focus()
    setIsOpen(true)
  }

  // Fires for every way the dialog closes, including Escape
  const handleClose = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button ref={triggerRef} onClick={open}>
        Edit profile
      </button>

      <dialog ref={dialogRef} aria-labelledby="dialog-title" onClose={handleClose}>
        <FocusBoundary isLocked={isOpen}>
          <h2 id="dialog-title">Edit profile</h2>
          <input ref={firstFieldRef} aria-label="Name" />
          <input aria-label="Email" type="email" />
          <button onClick={() => dialogRef.current?.close()}>Cancel</button>
          <button onClick={() => dialogRef.current?.close()}>Save</button>
        </FocusBoundary>
      </dialog>
    </>
  )
}
```

## Accessibility

A focus trap must always have a keyboard way out ([WCAG 2.1.2: No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)). Whenever `isLocked` is `true`, make sure users can close or leave with the keyboard, for example with Escape or a close button inside the boundary.

## Compatibility

- React 18 and 19
- Next.js App Router and other React Server Components setups: the package is marked `'use client'`
- TypeScript types included
- ESM `import`, plus CommonJS `require()` on Node 20.19+ or 22.12+

## Contributing

```sh
npm install
npm run dev
```

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Serve the example app in `example/`            |
| `npm test`          | Run tests in watch mode                        |
| `npm run test:run`  | Run tests once                                 |
| `npm run typecheck` | Type-check `src`, `example` and `test`         |
| `npm run build`     | Build the library to `dist/` (only `src/`)     |

- `src/`: the published library. `src/index.ts` is the package entry point.
- `example/`: demo app, imports straight from `src/`. Not published.
- `test/`: Vitest and Testing Library tests. Not published.

### Releasing

Releases are published to npm by GitHub Actions when a `v*` tag is pushed. Bump the version in a pull request, then tag `main` after it merges:

```sh
git switch main && git pull
git switch -c release-x.y.z
npm version patch --no-git-tag-version   # or minor / major
git commit -am "Release x.y.z"
git push -u origin release-x.y.z
gh pr create --fill
# after CI passes and the PR is merged:
git switch main && git pull
git tag vx.y.z
git push origin vx.y.z
```

The release workflow checks that the tag matches the version in `package.json` before publishing.

## License

MIT © James Boatwright
