export const getFriendlyLabel = (method: string, path: string): string => {
  const methodMap: Record<string, string> = {
    GET: 'Read',
    POST: 'Create',
    PUT: 'Update',
    PATCH: 'Update',
    DELETE: 'Delete',
  }

  const action = methodMap[method.toUpperCase()] || method.toUpperCase()

  let resource = path
    .replace('/v1/', '')
    .replace('/api/', '')
    .split('/')
    .filter((segment) => !segment.startsWith('{') && segment.length > 0)
    .join(' ')

  resource = resource
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace('tenants', 'tenant')
    .replace('projects', 'project')

  if (resource === '') resource = 'Endpoint'

  return `${action} ${resource}`
}
