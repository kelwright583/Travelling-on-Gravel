import { PostEditor } from '../PostEditor'

export const metadata = { title: 'New Dispatch | Base Camp' }

export default function NewDispatchPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        New Dispatch
      </h1>
      <PostEditor />
    </div>
  )
}
