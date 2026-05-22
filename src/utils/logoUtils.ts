import type { ThemeOption } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const isWithLogo = (option: ThemeOption) => option.includes('with_logo')

export const resolveLogoSrc = (logo: string) =>
  logo.startsWith('http') || logo.startsWith('data:')
    ? logo
    : `${BACKEND_API}${logo}`
