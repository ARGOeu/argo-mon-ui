export const isNotFoundError = (error: Error | null): boolean =>
  (error as (Error & { status?: number }) | null)?.status === 404
