import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocusBoundary } from '../src'

// jsdom has no layout engine, so getClientRects() always returns an empty list
// and tabbable would treat every element as hidden. Treat elements as visible
// unless they (or an ancestor) have the `hidden` attribute.
const getClientRects = Element.prototype.getClientRects
beforeAll(() => {
  Element.prototype.getClientRects = function (this: Element) {
    return (this.closest('[hidden]') ? [] : [new DOMRect()]) as unknown as DOMRectList
  }
})
afterAll(() => {
  Element.prototype.getClientRects = getClientRects
})

function setup(isLocked: boolean) {
  const user = userEvent.setup()
  const view = render(
    <>
      <button>before</button>
      <FocusBoundary isLocked={isLocked} data-testid="boundary" className="custom">
        <input aria-label="first" />
        <input aria-label="second" />
        <button tabIndex={-1}>not tabbable</button>
        <button hidden>hidden</button>
      </FocusBoundary>
      <button>after</button>
    </>,
  )
  return { user, ...view }
}

describe('FocusBoundary', () => {
  it('renders children and passes extra props to the div', () => {
    setup(false)
    const boundary = screen.getByTestId('boundary')
    expect(boundary.tagName).toBe('DIV')
    expect(boundary).toHaveClass('custom')
    expect(screen.getByLabelText('first')).toBeInTheDocument()
  })

  it('lets focus leave when unlocked', async () => {
    const { user } = setup(false)
    await user.click(screen.getByLabelText('second'))
    await user.tab()
    expect(screen.getByText('after')).toHaveFocus()
  })

  it('wraps Tab from the last focusable item to the first when locked', async () => {
    const { user } = setup(true)
    await user.click(screen.getByLabelText('second'))
    await user.tab()
    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('wraps Shift+Tab from the first focusable item to the last when locked', async () => {
    const { user } = setup(true)
    await user.click(screen.getByLabelText('first'))
    await user.tab({ shift: true })
    expect(screen.getByLabelText('second')).toHaveFocus()
  })

  it('moves focus normally between items inside the boundary', async () => {
    const { user } = setup(true)
    await user.click(screen.getByLabelText('first'))
    await user.tab()
    expect(screen.getByLabelText('second')).toHaveFocus()
  })

  it('releases focus when isLocked changes from true to false', async () => {
    const { user, rerender } = setup(true)
    rerender(
      <>
        <button>before</button>
        <FocusBoundary isLocked={false}>
          <input aria-label="first" />
          <input aria-label="second" />
        </FocusBoundary>
        <button>after</button>
      </>,
    )
    await user.click(screen.getByLabelText('second'))
    await user.tab()
    expect(screen.getByText('after')).toHaveFocus()
  })

  it('skips disabled controls when finding the last focusable item', async () => {
    const user = userEvent.setup()
    render(
      <>
        <FocusBoundary isLocked>
          <input aria-label="first" />
          <input aria-label="second" />
          <button disabled>disabled</button>
          <fieldset disabled>
            <input aria-label="in disabled fieldset" />
          </fieldset>
        </FocusBoundary>
        <button>after</button>
      </>,
    )
    await user.click(screen.getByLabelText('second'))
    await user.tab()
    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('treats a radio group as one stop, using the selected radio', async () => {
    const user = userEvent.setup()
    render(
      <>
        <FocusBoundary isLocked>
          <input aria-label="first" />
          <input type="radio" name="size" aria-label="small" defaultChecked />
          <input type="radio" name="size" aria-label="large" />
        </FocusBoundary>
        <button>after</button>
      </>,
    )
    await user.click(screen.getByLabelText('small'))
    await user.tab()
    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('ignores non-link elements with an href attribute', async () => {
    const user = userEvent.setup()
    render(
      <>
        <FocusBoundary isLocked>
          <input aria-label="first" />
          <input aria-label="second" />
          {/* @ts-expect-error href is not a valid div attribute */}
          <div href="#not-a-link">not a link</div>
        </FocusBoundary>
        <button>after</button>
      </>,
    )
    await user.click(screen.getByLabelText('second'))
    await user.tab()
    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('forwards an object ref to the root div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<FocusBoundary ref={ref} data-testid="boundary" />)
    expect(ref.current).toBe(screen.getByTestId('boundary'))
  })

  it('forwards a callback ref and clears it on unmount', () => {
    const ref = vi.fn()
    const { unmount } = render(<FocusBoundary ref={ref} data-testid="boundary" />)
    expect(ref).toHaveBeenLastCalledWith(screen.getByTestId('boundary'))
    unmount()
    expect(ref).toHaveBeenLastCalledWith(null)
  })

  it('has a readable name in React DevTools', () => {
    expect(FocusBoundary.displayName).toBe('FocusBoundary')
  })

  it('does nothing when locked with no focusable children', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button>before</button>
        <FocusBoundary isLocked>
          <p>No focusable content</p>
        </FocusBoundary>
        <button>after</button>
      </>,
    )
    await user.click(screen.getByText('before'))
    await user.tab()
    expect(screen.getByText('after')).toHaveFocus()
  })
})
