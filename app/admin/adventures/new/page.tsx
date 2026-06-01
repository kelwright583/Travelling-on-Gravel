import { AdventureEditor } from '../AdventureEditor'

export const metadata = { title: 'New Adventure | Base Camp' }

export default function NewAdventurePage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        New Adventure
      </h1>
      <AdventureEditor />
    </div>
  )
}
