export type LocalizedText = { en: string; de?: string }

export interface Ingredient {
  id: string
  qty?: number | null
  unit?: string | null
  item: LocalizedText
  note?: LocalizedText
}

export interface IngredientGroup {
  id: string
  heading?: LocalizedText
  items: Ingredient[]
}

export interface Step {
  id: string
  text: LocalizedText
  minutes?: number | null
  image?: string | null
}

export interface AiNotes {
  summary?: string
  warnings?: string[]
  suggestions?: string[]
  missing?: string[]
  voice?: string
  formatted?: {
    intro?: string
    steps?: string[]
  }
}

export const UNITS = [
  'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'clove', 'whole', 'pinch', 'to taste',
  'handful', 'slice', 'piece', 'can', 'stick', 'bunch',
] as const

export type Unit = (typeof UNITS)[number]

export const COOK_METHODS = [
  { value: 'fire', label: 'Open Fire' },
  { value: 'coals', label: 'Coals' },
  { value: 'potjie', label: 'Potjie' },
  { value: 'braai-grid', label: 'Braai Grid' },
  { value: 'skottel', label: 'Skottel' },
  { value: 'gas', label: 'Gas' },
  { value: 'dutch-oven', label: 'Dutch Oven' },
  { value: 'other', label: 'Other' },
] as const

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const

export const PRESET_TAGS = [
  'Quick & Easy',
  'Braai Master',
  'One-Pot',
  'Potjie',
  'Crowd-Pleaser',
  'Low & Slow',
  'Campfire',
  'Vegetarian',
] as const
