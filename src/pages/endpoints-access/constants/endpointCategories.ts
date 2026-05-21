export const CATEGORY_MATCHERS: Array<{
  label: string
  match: (path: string) => boolean
}> = [
  { label: 'Admin', match: (p) => p.startsWith('/v1/admin') },
  {
    label: ' API Resources',
    match: (p) =>
      p.startsWith('/v1/api-resources') || p.startsWith('/api-resources'),
  },
  { label: 'Automation', match: (p) => p.startsWith('/v1/automation') },
  { label: 'Capabilities', match: (p) => p.includes('/capabilities/') },
  { label: 'Encrypt', match: (p) => p.includes('/encrypt') },
  { label: 'Profiles', match: (p) => p.includes('-profiles') },
  { label: 'Public Status Pages', match: (p) => p.startsWith('/v1/public') },
  { label: 'Reports', match: (p) => p.includes('/reports') },
  {
    label: 'Roles',
    match: (p) => p.startsWith('/v1/roles') || p.startsWith('/roles'),
  },
  {
    label: 'Secured Endpoints',
    match: (p) =>
      p.startsWith('/v1/secured-endpoints') ||
      p.startsWith('/secured-endpoints'),
  },
  {
    label: 'Status Pages',
    match: (p) => p.includes('/pages') || p.includes('/status-pages'),
  },
  { label: 'Tenants', match: (p) => p.startsWith('/v1/tenants') },
  { label: 'Topologies', match: (p) => p.includes('/topology') },
  {
    label: 'Users',
    match: (p) => p.startsWith('/v1/users') || p.startsWith('/users'),
  },
]
