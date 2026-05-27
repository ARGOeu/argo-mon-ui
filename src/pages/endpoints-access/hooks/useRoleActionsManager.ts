import { useState, useEffect, useMemo } from 'react'
import type { EndpointAssignment } from '@/types/securedEndpoints'

export const useRoleActionsManager = (
  roleAssignments: EndpointAssignment[],
) => {
  const [selectedAssignments, setSelectedAssignments] = useState<
    EndpointAssignment[]
  >([])
  const [hasUserModified, setHasUserModified] = useState(false)

  useEffect(() => {
    setSelectedAssignments(roleAssignments)
    setHasUserModified(false)
  }, [roleAssignments])

  const isDirty = useMemo(() => {
    if (!hasUserModified) return false
    const savedMap = new Map(
      roleAssignments.map((a) => [a.secured_endpoint_id, a.scope]),
    )
    const currentMap = new Map(
      selectedAssignments.map((a) => [a.secured_endpoint_id, a.scope]),
    )
    if (savedMap.size !== currentMap.size) return true
    for (const [id, scope] of savedMap) {
      if (!currentMap.has(id) || currentMap.get(id) !== scope) return true
    }
    return false
  }, [roleAssignments, selectedAssignments, hasUserModified])

  const addedCount = useMemo(() => {
    if (!hasUserModified) return 0
    const savedIds = new Set(roleAssignments.map((a) => a.secured_endpoint_id))
    return selectedAssignments.filter(
      (a) => !savedIds.has(a.secured_endpoint_id),
    ).length
  }, [roleAssignments, selectedAssignments, hasUserModified])

  const removedCount = useMemo(() => {
    if (!hasUserModified) return 0
    const currentIds = new Set(
      selectedAssignments.map((a) => a.secured_endpoint_id),
    )
    return roleAssignments.filter((a) => !currentIds.has(a.secured_endpoint_id))
      .length
  }, [roleAssignments, selectedAssignments, hasUserModified])

  const toggleAction = (actionId: string) => {
    setHasUserModified(true)
    setSelectedAssignments((current) => {
      const exists = current.some((a) => a.secured_endpoint_id === actionId)
      return exists
        ? current.filter((a) => a.secured_endpoint_id !== actionId)
        : [...current, { secured_endpoint_id: actionId }]
    })
  }

  const setScope = (endpointId: string, scope: string) => {
    setHasUserModified(true)
    setSelectedAssignments((current) =>
      current.map((a) =>
        a.secured_endpoint_id === endpointId ? { ...a, scope } : a,
      ),
    )
  }

  return {
    selectedAssignments,
    toggleAction,
    setScope,
    isDirty,
    addedCount,
    removedCount,
  }
}
