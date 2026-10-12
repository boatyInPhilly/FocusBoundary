import { forwardRef, useCallback, useEffect, useRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { tabbable } from 'tabbable'

const TAB = 'Tab'

export interface FocusBoundaryProps extends ComponentPropsWithoutRef<'div'> {
  isLocked?: boolean
}

export const FocusBoundary = forwardRef<HTMLDivElement, FocusBoundaryProps>(
  ({ isLocked = false, children, ...otherProps }, ref) => {
    const rootNode = useRef<HTMLDivElement | null>(null)

    // Keep our own ref for the trap and pass the same node to the consumer's ref
    const setRootNode = useCallback(
      (node: HTMLDivElement | null) => {
        rootNode.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        const { key, shiftKey } = event
        const root = rootNode.current

        if (!isLocked || !root) return

        if (key !== TAB) return

        // tabbable returns elements in the browser's actual Tab order, excluding
        // disabled, hidden, inert and tabindex="-1" elements and unselected radios
        const focusableItems = tabbable(root)

        const firstFocusableItem = focusableItems[0]
        const lastFocusableItem = focusableItems.at(-1)

        if (!firstFocusableItem || !lastFocusableItem) return

        if (!shiftKey && document.activeElement === lastFocusableItem) {
          event.preventDefault()
          firstFocusableItem.focus()
        } else if (shiftKey && document.activeElement === firstFocusableItem) {
          event.preventDefault()
          lastFocusableItem.focus()
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => {
        window.removeEventListener('keydown', handleKeyPress)
      }
    }, [isLocked])

    return (
      <div {...otherProps} ref={setRootNode}>
        {children}
      </div>
    )
  },
)

FocusBoundary.displayName = 'FocusBoundary'
