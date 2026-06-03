import { z } from 'zod'

export const localizedTextSchema = z.object({
  en: z.string().default(''),
  de: z.string().optional(),
})

export const ingredientSchema = z.object({
  id: z.string(),
  qty: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  item: localizedTextSchema,
  note: localizedTextSchema.optional(),
})

export const ingredientGroupSchema = z.object({
  id: z.string(),
  heading: localizedTextSchema.optional(),
  items: z.array(ingredientSchema).default([]),
})

export const stepSchema = z.object({
  id: z.string(),
  text: localizedTextSchema,
  minutes: z.number().nullable().optional(),
  image: z.string().nullable().optional(),
})

export const recipeFormSchema = z.object({
  title_en: z.string().min(1, 'Title is required'),
  title_de: z.string().optional(),
  subtitle_en: z.string().optional(),
  subtitle_de: z.string().optional(),
  intro_en: z.string().optional(),
  intro_de: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug: lowercase, numbers and hyphens only'),
  cover_image: z.string().nullable().optional(),
  prep_minutes: z.number().int().nonnegative().nullable().optional(),
  cook_minutes: z.number().int().nonnegative().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  cook_method: z
    .enum(['fire', 'coals', 'potjie', 'braai-grid', 'skottel', 'gas', 'dutch-oven', 'other'])
    .default('fire'),
  ingredients: z.array(ingredientGroupSchema).default([]),
  steps: z.array(stepSchema).default([]),
  tips: z.array(localizedTextSchema).default([]),
  equipment: z.array(localizedTextSchema).default([]),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  published_at: z.string().nullable().optional(),
})

export type RecipeFormData = z.infer<typeof recipeFormSchema>
