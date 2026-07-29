export const stripHostnameSuffix = (hostname?: string): string =>
  hostname?.split('_')[0] ?? ''
