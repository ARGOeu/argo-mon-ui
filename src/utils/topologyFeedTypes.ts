export const TOPOLOGY_FEED_TYPE_LABELS: Record<string, string> = {
  internal: 'Internal',
  external: 'External',
  CSV: 'CSV',
  'desy-marketplace': 'Desy Marketplace',
  'node-registry': 'Node Registry',
  'eosc-service-catalog': 'EOSC Service Catalog',
}

export const TOPOLOGY_FEED_TYPE_OPTIONS = Object.entries(
  TOPOLOGY_FEED_TYPE_LABELS,
).map(([value, label]) => ({ value, label }))
