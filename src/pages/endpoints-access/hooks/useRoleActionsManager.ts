import { useState, useEffect, useMemo } from 'react'

export const useRoleActionsManager = (
  selectedRoleId: string | null,
  roleActionIds: string[],
) => {
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([])
  const [hasUserModified, setHasUserModified] = useState(false)

  useEffect(() => {
    setSelectedActionIds(roleActionIds)
    setHasUserModified(false)
  }, [selectedRoleId, roleActionIds])

  const isDirty = useMemo(() => {
    if (!hasUserModified) return false
    const saved = new Set(roleActionIds)
    const current = new Set(selectedActionIds)
    if (saved.size !== current.size) return true
    return [...saved].some((id) => !current.has(id))
  }, [roleActionIds, selectedActionIds, hasUserModified])

  const addedCount = useMemo(() => {
    if (!hasUserModified) return 0
    const saved = new Set(roleActionIds)
    return selectedActionIds.filter((id) => !saved.has(id)).length
  }, [roleActionIds, selectedActionIds, hasUserModified])

  const removedCount = useMemo(() => {
    if (!hasUserModified) return 0
    const current = new Set(selectedActionIds)
    return roleActionIds.filter((id) => !current.has(id)).length
  }, [roleActionIds, selectedActionIds, hasUserModified])

  const toggleAction = (
    actionId: string,
    selectAll?: boolean,
    allIds?: string[],
  ) => {
    setHasUserModified(true)
    if (allIds && selectAll !== undefined) {
      setSelectedActionIds((current) => {
        const next = new Set(current)
        if (selectAll) {
          allIds.forEach((id) => next.add(id))
        } else {
          allIds.forEach((id) => next.delete(id))
        }
        return Array.from(next)
      })
      return
    }

    setSelectedActionIds((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId],
    )
  }

  return {
    selectedActionIds,
    toggleAction,
    isDirty,
    addedCount,
    removedCount,
  }
}
