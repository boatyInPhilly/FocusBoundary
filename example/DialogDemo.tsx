import { useRef, useState } from 'react'
// Import from src so the example reflects local changes with hot reload.
import { FocusBoundary } from '../src'

export function DialogDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const open = () => {
    dialogRef.current?.showModal()
    firstFieldRef.current?.focus()
    setIsOpen(true)
  }

  // Every way of closing (buttons or Escape) ends up in handleClose via the
  // dialog's native close event, so state and focus return live in one place.
  const close = () => dialogRef.current?.close()

  const handleClose = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <section>
      <h2>Modal dialog</h2>
      <p>
        Opening the dialog locks focus inside it and moves focus to the first field. Closing it
        (buttons or Escape) returns focus to the button that opened it.
      </p>

      <button ref={triggerRef} type="button" onClick={open}>
        Open dialog
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="dialog-title"
        onClose={handleClose}
        className="dialog"
      >
        <FocusBoundary isLocked={isOpen} className="dialog-content">
          <h3 id="dialog-title" className="dialog-title">
            Edit profile
          </h3>
          <label className="field">
            Name
            <input ref={firstFieldRef} />
          </label>
          <label className="field">
            Email
            <input type="email" />
          </label>
          <div className="dialog-actions">
            <button type="button" onClick={close}>
              Cancel
            </button>
            <button type="button" onClick={close}>
              Save
            </button>
          </div>
        </FocusBoundary>
      </dialog>
    </section>
  )
}
