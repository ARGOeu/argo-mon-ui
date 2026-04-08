export const CATEGORY_MATCHERS: Array<{
  label: string
  match: (path: string) => boolean
}> = [
  { label: 'Admin', match: (p) => p.startsWith('/v1/admin') },
  // { label: 'Automation', match: (p) => p.includes('/automation') },
  // { label: 'Capabilities', match: (p) => p.includes('/capabilities/') },
  { label: 'Encrypt', match: (p) => p.includes('/encrypt') },
  { label: 'Profiles', match: (p) => p.includes('-profiles') },
  // { label: 'Public Status Pages', match: (p) => p.startsWith('/status/') },
  { label: 'Reports', match: (p) => p.includes('/reports') },
  {
    label: 'Secured Endpoints',
    match: (p) => p.startsWith('/secured-endpoints'),
  },
  {
    label: 'Status Pages',
    match: (p) => p.includes('/pages') || p.includes('/status-pages'),
  },
  { label: 'Tenant', match: (p) => p.startsWith('/v1/tenants') },
  { label: 'Topologies', match: (p) => p.includes('/topology') },
  { label: 'User', match: (p) => p.startsWith('/v1/users') },
]

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  ...CATEGORY_MATCHERS.map(({ label }) => ({ value: label, label })),
]
