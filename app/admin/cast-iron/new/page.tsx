import { RecipeEditor } from '../RecipeEditor'

export const metadata = { title: 'New Recipe | Base Camp' }

export default function NewRecipePage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        New Recipe
      </h1>
      <RecipeEditor />
    </div>
  )
}
