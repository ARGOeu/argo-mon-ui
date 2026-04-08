export const AVAILABLE_RULES = [
  {
    description: 'Only super administrators have access.',
    title: 'Super Admin',
    value: 'group:status-pages:role=super_admin',
  },
  {
    description: 'Administrators of a certain tenant have access.',
    title: 'Tenant Administrator',
    value: 'group:status-pages:tenants:{id}:role=admin',
  },
  {
    description: 'Members of a certain tenant have access.',
    title: 'Tenant Member',
    value: 'group:status-pages:tenants:{id}:role=viewer',
  },
  {
    description: 'Every registered user of the application has access.',
    title: 'Any Registered Member',
    value: 'group:status-pages:members:role=member',
  },
]
