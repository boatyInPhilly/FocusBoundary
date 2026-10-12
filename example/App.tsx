import { DialogDemo } from './DialogDemo'
import { InlineDemo } from './InlineDemo'

export function App() {
  return (
    <main className="page">
      <h1>FocusBoundary</h1>
      <InlineDemo />
      <hr className="divider" />
      <DialogDemo />
    </main>
  )
}
