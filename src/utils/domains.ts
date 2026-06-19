const PLATFORM_HOSTNAMES = (
  import.meta.env.VITE_PLATFORM_HOSTNAMES ?? ''
).split(',')

export function isPlatformDomain(): boolean {
  return PLATFORM_HOSTNAMES.includes(window.location.hostname)
}
