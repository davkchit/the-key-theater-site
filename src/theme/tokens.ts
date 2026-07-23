/**
 * TS mirror of the Tailwind theme (src/styles/index.css `@theme`).
 * Use these where a real hex value is needed in JS (SVG fill, canvas, etc.);
 * use the Tailwind classes (bg-brand-yellow, text-ink, ...) everywhere else.
 */
export const colors = {
  paper: '#F6F0E0',
  ink: '#1A1A1A',
  yellow: '#FFD700',
  red: '#E32324',
  blue: '#0B54A0',
} as const

export type BrandColorKey = 'yellow' | 'red' | 'blue' | 'ink'

export const brandColorHex: Record<BrandColorKey, string> = {
  yellow: colors.yellow,
  red: colors.red,
  blue: colors.blue,
  ink: colors.ink,
}

export const fonts = {
  heading: "'Oswald', sans-serif",
  body: "'Manrope', sans-serif",
  script: "'Marck Script', cursive",
} as const
