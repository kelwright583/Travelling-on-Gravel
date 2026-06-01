/**
 * Design token definitions — single source of truth.
 * These defaults are overridable at runtime via site_settings.theme (persisted in DB).
 * SSR injects resolved values as CSS custom properties on :root to avoid FOUC.
 */

export const defaultTokens = {
  // Colour palette
  '--bone': '#EFEAD9',
  '--khaki': '#B9A77B',
  '--khaki-deep': '#8E7C50',
  '--olive': '#3B4329',
  '--olive-2': '#535C3A',
  '--ink': '#15150F',
  '--ink-soft': '#21211A',
  '--accent': '#D75E2C',
  '--accent-soft': '#E8814F',
  '--line': 'rgba(239,234,217,.14)',
} as const

export type ThemeTokenKey = keyof typeof defaultTokens
export type ThemeOverrides = Partial<Record<ThemeTokenKey, string>>

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

/** Presets the admin theme editor can offer as one-click resets. */
export const themePresets: Record<string, ThemeOverrides> = {
  default: {},
  desert: {
    '--accent': '#C8501E',
    '--olive': '#4A3B1F',
    '--olive-2': '#6B5530',
    '--khaki': '#C4A96A',
    '--khaki-deep': '#9A7F48',
  },
  slate: {
    '--accent': '#5C8FAF',
    '--olive': '#2B3A47',
    '--olive-2': '#3E5568',
    '--khaki': '#8FA8BC',
    '--khaki-deep': '#6A8499',
  },
}
