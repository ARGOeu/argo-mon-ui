import type { EndpointTopologyItem } from '@/types/topology'

export const getEndpointHostname = (endpoint: EndpointTopologyItem): string =>
  endpoint.tags?.hostname || endpoint.hostname
