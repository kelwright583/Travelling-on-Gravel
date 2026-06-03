'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  lat: z.string().refine((v) => !isNaN(parseFloat(v)), 'Latitude must be a number'),
  lng: z.string().refine((v) => !isNaN(parseFloat(v)), 'Longitude must be a number'),
  category: z.string().optional(),
  country: z.string().optional(),
  note_en: z.string().optional(),
  related_post_id: z.string().optional(),
})

export type PinState = { message: string; ok: boolean }

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function extractRaw(formData: FormData) {
  return {
    label: formData.get('label') as string,
    lat: formData.get('lat') as string,
    lng: formData.get('lng') as string,
    category: (formData.get('category') as string) || undefined,
    country: (formData.get('country') as string) || undefined,
    note_en: (formData.get('note_en') as string) || undefined,
    related_post_id: (formData.get('related_post_id') as string) || undefined,
  }
}

function buildPayload(data: z.infer<typeof schema>) {
  return {
    label: data.label,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    category: data.category || null,
    country: data.country || null,
    note: data.note_en ? { en: data.note_en } : null,
    related_post_id: data.related_post_id || null,
  }
}

export async function createPin(
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const result = schema.safeParse(extractRaw(formData))
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { data, error } = await supabase
    .from('map_pins')
    .insert(buildPayload(result.data))
    .select('id')
    .single()

  if (error) return { message: error.message, ok: false }

  revalidatePath('/map')
  revalidatePath('/')
  redirect(`/admin/pins/${data.id}`)
}

export async function updatePin(
  id: string,
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const result = schema.safeParse(extractRaw(formData))
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { error } = await supabase
    .from('map_pins')
    .update(buildPayload(result.data))
    .eq('id', id)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/map')
  revalidatePath('/')
  return { message: 'Pin saved.', ok: true }
}

export async function deletePin(id: string): Promise<void> {
  const { supabase, user } = await getAuthUser()
  if (!user) return

  await supabase.from('map_pins').delete().eq('id', id)
  revalidatePath('/map')
  revalidatePath('/')
  redirect('/admin/pins')
}
