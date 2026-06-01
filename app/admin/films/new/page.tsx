import { FilmEditor } from '../FilmEditor'

export const metadata = { title: 'Add Film | Base Camp' }

export default function NewFilmPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        Add Film
      </h1>
      <FilmEditor />
    </div>
  )
}
