import { useState } from 'react'
// Import from src so the example reflects local changes with hot reload.
import { FocusBoundary } from '../src'

export function InlineDemo() {
  const [isLocked, setIsLocked] = useState(false)

  return (
    <section>
      <h2>Inline boundary</h2>
      <p>
        Toggle the lock, then use Tab and Shift+Tab. While locked, focus wraps inside the boundary
        instead of leaving it.
      </p>

      <button type="button">Outside (before)</button>

      <FocusBoundary
        isLocked={isLocked}
        aria-label="Focus boundary demo"
        className={isLocked ? 'boundary is-locked' : 'boundary'}
      >
        <label className="field">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(event) => setIsLocked(event.target.checked)}
          />{' '}
          Lock focus ({isLocked ? 'on' : 'off'})
        </label>
        <input placeholder="Name" /> <input placeholder="Email" />
        <p>
          <a href="#example">A link</a>{' '}
          <button type="button" tabIndex={-1}>
            Not tabbable (tabindex -1)
          </button>{' '}
          <button type="button" className="hidden">
            Hidden
          </button>
          <button type="button">Last focusable</button>
        </p>
      </FocusBoundary>

      <button type="button">Outside (after)</button>
    </section>
  )
}
