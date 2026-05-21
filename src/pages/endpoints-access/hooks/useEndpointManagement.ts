import { useState } from 'react'

export const useGroupCollapse = () => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const handleToggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const collapseAll = (labels: string[]) => {
    setCollapsedGroups(new Set(labels))
  }

  const expandAll = () => {
    setCollapsedGroups(new Set())
  }

  return { collapsedGroups, handleToggleGroup, collapseAll, expandAll }
}
