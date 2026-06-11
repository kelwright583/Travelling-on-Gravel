/**
 * Design token definitions — single source of truth.
 * These defaults are overridable at runtime via site_settings.theme (persisted in DB).
 * SSR injects resolved values as CSS custom properties on :root to avoid FOUC.
 */

export const defaultTokens = {
  // Colour palette — Travelling on Gravel brand v1
  '--bone': '#F8E8D8',      // Warm Cream
  '--khaki': '#E9D6BE',     // Dust Sand
  '--khaki-deep': '#5C5A55', // Gravel Grey
  '--olive': '#4B563F',     // Olive Track
  '--olive-2': '#5F6E50',   // Olive Track light
  '--ink': '#111111',       // Gravel Black
  '--ink-soft': '#1E1E1C',  // Deep Charcoal
  '--accent': '#EA5B12',    // Sunset Orange
  '--accent-soft': '#C9470D', // Sunset Hover
  '--line': 'rgba(248,232,216,.14)',
} as const

export type ThemeTokenKey = keyof typeof defaultTokens
export type ThemeOverrides = Partial<Record<ThemeTokenKey, string>>

export interface ThemePreset {
  id: string
  name: string
  overrides: ThemeOverrides
}

/**
 * Merge DB overrides on top of defaults and return a CSS :root rule string
 * suitable for injection in <style> tags to prevent FOUC.
 */
export function buildCssVars(overrides: ThemeOverrides = {}): string {
  const merged = { ...defaultTokens, ...overrides }
  const declarations = Object.entries(merged)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  return `:root {\n${declarations}\n}`
}

/** Resolve full token map by merging overrides on top of defaults */
export function resolveTokens(overrides: ThemeOverrides = {}): Record<ThemeTokenKey, string> {
  return { ...defaultTokens, ...overrides }
}

/** Built-in presets — shipped with the codebase, not editable. */
export const BUILT_IN_PRESETS: ThemePreset[] = [
  {
    id: 'gravel',
    name: 'Gravel',
    overrides: {},
  },
  {
    id: 'desert',
    name: 'Desert Dusk',
    overrides: {
      '--accent': '#C8501E',
      '--accent-soft': '#DC7040',
      '--olive': '#4A3B1F',
      '--olive-2': '#6B5530',
      '--khaki': '#C4A96A',
      '--khaki-deep': '#9A7F48',
    },
  },
  {
    id: 'slate',
    name: 'Blue Slate',
    overrides: {
      '--accent': '#5C8FAF',
      '--accent-soft': '#7BAAC8',
      '--olive': '#2B3A47',
      '--olive-2': '#3E5568',
      '--khaki': '#8FA8BC',
      '--khaki-deep': '#6A8499',
    },
  },
  {
    id: 'bushveld',
    name: 'Bushveld',
    overrides: {
      '--accent': '#7A9E3E',
      '--accent-soft': '#96BC55',
      '--olive': '#2F3D1A',
      '--olive-2': '#445929',
      '--khaki': '#A8B87A',
      '--khaki-deep': '#7D8F52',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Run',
    overrides: {
      '--accent': '#9B6FD4',
      '--accent-soft': '#B490E0',
      '--olive': '#2A1F3D',
      '--olive-2': '#3D2F58',
      '--khaki': '#A090C0',
      '--khaki-deep': '#7A6A9A',
      '--ink': '#0D0B14',
      '--ink-soft': '#161220',
    },
  },
  {
    id: 'kalahari',
    name: 'Kalahari Red',
    overrides: {
      '--accent': '#B8360E',
      '--accent-soft': '#D45025',
      '--olive': '#5C2A12',
      '--olive-2': '#7A3C1E',
      '--bone': '#F5EDD8',
      '--khaki': '#D4A870',
      '--khaki-deep': '#A87840',
    },
  },
]

/** @deprecated Use BUILT_IN_PRESETS instead */
export const themePresets: Record<string, ThemeOverrides> = {
  default: {},
  desert: BUILT_IN_PRESETS.find((p) => p.id === 'desert')!.overrides,
  slate: BUILT_IN_PRESETS.find((p) => p.id === 'slate')!.overrides,
}
