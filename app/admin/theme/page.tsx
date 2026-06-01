import { Palette } from 'lucide-react'

export const metadata = { title: 'Theme | Base Camp' }

export default function ThemePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Palette size={40} className="mb-4 text-khaki-deep" />
      <h1 className="font-display mb-2 text-xl font-800 uppercase tracking-tight text-bone">
        Theme Editor
      </h1>
      <p className="max-w-sm text-sm text-khaki">
        Live colour pickers, presets, and CSS variable injection coming in Phase 8.
      </p>
    </div>
  )
}
