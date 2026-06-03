import { PostEditor } from '../PostEditor'

export const metadata = { title: 'New Field Note | Base Camp' }

export default function NewFieldWorkPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        New Field Note
      </h1>
      <PostEditor />
    </div>
  )
}
