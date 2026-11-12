export type TopologyTags = Record<string, string>

export type TopologyNotifications = {
  contacts: string[]
  enabled: boolean
}

export type EndpointTopologyItem = {
  date: string
  group: string
  type: string
  service: string
  hostname: string
  tags?: TopologyTags
  notifications?: TopologyNotifications
}

export type EndpointWithGroups = Omit<EndpointTopologyItem, 'group'> & {
  groups: string[]
}

export type GroupTopologyItem = {
  date: string
  group: string
  type: string
  subgroup: string
  tags?: TopologyTags
  notifications?: TopologyNotifications
}

// The public topology group endpoint has no notifications and its tags have only the scope
export type PublicGroupTopologyItem = Omit<GroupTopologyItem, 'notifications'>

export type ServiceType = {
  name: string
  title: string
  description: string
  tags: string[]
}

export type CreateTopologyEndpointResponse = {
  message: string
  code: string
}
