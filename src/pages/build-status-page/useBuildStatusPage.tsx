import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type {
  useSavePageMutation,
  useUpdatePageMutation,
} from '@/hooks/usePages'
import type { useGroupsMutation } from '@/hooks/useGroups'
import type { StatusItemType, StatusGroupType } from '@/types/common'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export type PageFormValues = {
  name: string
  slug: string
  tenantId: string
  report: string
  title: string
  desc: string
  selectIcon: string
  selectText: string
  themeOption: 'theme_1' | 'theme_2'
  color: string
  logo: string
  columns: string
}

const toastErrors = (error: Error & { errors?: string[] }, action: string) => {
  if (error.errors && error.errors.length > 0) {
    toast.error(
      <div>
        {error.errors.map((err, idx) => (
          <div key={idx}>{err}</div>
        ))}
      </div>,
    )
  } else {
    toast.error(`Failed to ${action} status page: ${error.message}`)
  }
}

interface UseBuildStatusPageParams {
  isEditMode: boolean
  pageId: string | undefined
  statusGroups: StatusGroupType[]
  setStatusGroups: Dispatch<SetStateAction<StatusGroupType[]>>
  setSaved: Dispatch<SetStateAction<boolean>>
  setItems: Dispatch<SetStateAction<StatusItemType[]>>
  saveMutate: ReturnType<typeof useSavePageMutation>['mutate']
  updateMutate: ReturnType<typeof useUpdatePageMutation>['mutate']
  groupsMutate: ReturnType<typeof useGroupsMutation>['mutate']
  nextGroupIdRef: RefObject<number>
  leftIndexRef: RefObject<Map<string, number>>
}

export const useBuildStatusPage = ({
  isEditMode,
  pageId,
  statusGroups,
  setStatusGroups,
  setSaved,
  setItems,
  saveMutate,
  updateMutate,
  groupsMutate,
  nextGroupIdRef,
  leftIndexRef,
}: UseBuildStatusPageParams) => {
  const navigate = useNavigate()

  const initGroups = (groups: StatusGroupType[]) => {
    setStatusGroups(groups)
    setSaved(true)

    if (groups.length > 0) {
      const maxId = groups.reduce((max, group) => {
        const match = group.name.match(/^group-(\d+)$/)
        if (match) {
          const id = parseInt(match[1], 10)
          return id > max ? id : max
        }
        return max
      }, 0)
      nextGroupIdRef.current = maxId + 1
    }
  }

  const triggerGroupsMutation = (tenantId: string, reportId: string) => {
    groupsMutate({ tenantId, reportId })
  }

  const handleAddStatusGroup = () => {
    const newGroupId = nextGroupIdRef.current
    setStatusGroups((prev) => [
      ...prev,
      {
        name: `group-${newGroupId}`,
        alias: `group-${newGroupId}`,
        list: [],
      },
    ])
    nextGroupIdRef.current = newGroupId + 1
  }

  const handleChangeItemAlias = (
    groupName: string,
    itemName: string,
    newAlias: string,
  ) => {
    if (groupName !== '') {
      setStatusGroups((prev) =>
        prev.map((group) =>
          group.name === groupName
            ? {
                ...group,
                list: group.list.map((item) =>
                  item.name === itemName ? { ...item, alias: newAlias } : item,
                ),
              }
            : group,
        ),
      )
    }
  }

  const updateGroup = (groupIndex: number, nextItems: StatusItemType[]) => {
    setStatusGroups((prev) => {
      const movedNames = new Set(nextItems.map((it) => it.name))
      const next = prev.map((g, i) =>
        i === groupIndex
          ? { ...g, list: nextItems }
          : { ...g, list: g.list.filter((it) => !movedNames.has(it.name)) },
      )
      setItems((curr) => curr.filter((it) => !movedNames.has(it.name)))
      return next
    })
  }

  const renameGroup = (groupIndex: number, nextAlias: string) => {
    setStatusGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, alias: nextAlias } : g)),
    )
  }

  const removeGroup = (groupIndex: number) => {
    setStatusGroups((prev) => {
      const removed = prev[groupIndex]?.list ?? []

      if (removed.length) {
        setItems((curr) => {
          const leftIndex = leftIndexRef.current

          // avoid duplicates
          const currNames = new Set(curr.map((x) => x.name))
          const toReturn = removed.filter((it) => !currNames.has(it.name))

          // merge with current left list
          const merged = [...curr, ...toReturn]

          // sort by previously recorded index; unknowns go to the end (stable tiebreaker by name)
          const FALLBACK = Number.MAX_SAFE_INTEGER / 2
          merged.sort((a, b) => {
            const ia = leftIndex.get(a.name) ?? FALLBACK
            const ib = leftIndex.get(b.name) ?? FALLBACK
            if (ia !== ib) return ia - ib
            return a.name.localeCompare(b.name)
          })

          return merged
        })
      }

      // finally remove the column
      return prev.filter((_, i) => i !== groupIndex)
    })
  }

  const handlePageSave = (values: PageFormValues) => {
    const {
      name,
      slug,
      tenantId,
      report,
      title,
      desc,
      selectIcon,
      selectText,
      themeOption,
      color,
      logo,
      columns,
    } = values

    const data = {
      name,
      slug,
      'report-id': report,
      config: {
        groups: statusGroups,
        title,
        description: desc,
        theming: {
          option: themeOption,
          status: { icon: selectIcon, text: selectText },
          ...(themeOption !== 'theme_2' &&
            logo && {
              logo:
                logo.startsWith('http') || logo.startsWith('data:')
                  ? logo
                  : `${BACKEND_API}${logo}`,
            }),
          color,
          columns,
        },
      },
    }

    if (isEditMode && pageId) {
      updateMutate(
        { tenantId, pageId, data },
        {
          onSuccess: () => {
            toast.success('Page updated successfully!')
            setSaved(true)
          },
          onError: (error) => toastErrors(error, 'update'),
        },
      )
    } else {
      saveMutate(
        { tenantId, data },
        {
          onSuccess: (savedData) => {
            toast.success('Page created successfully!')
            setSaved(true)
            if (savedData.id) {
              navigate(
                `/status-pages/tenants/${tenantId}/pages/${savedData.id}`,
              )
            }
          },
          onError: (error) => toastErrors(error, 'create'),
        },
      )
    }
  }

  return {
    initGroups,
    triggerGroupsMutation,
    handlePageSave,
    handleAddStatusGroup,
    handleChangeItemAlias,
    updateGroup,
    renameGroup,
    removeGroup,
  }
}
