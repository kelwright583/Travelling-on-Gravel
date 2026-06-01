import { PinEditor } from '../PinEditor'

export const metadata = { title: 'New Pin | Base Camp' }

export default function NewPinPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        Drop a Pin
      </h1>
      <PinEditor />
    </div>
  )
}
