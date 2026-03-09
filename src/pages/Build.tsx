import { useEffect, useRef, useState } from 'react'
import { useGroupsMutation } from '@/hooks/useGroups'
import { useGetUserTenants, useGetTenantReports } from '@/hooks/useTenants'
import {
  useSavePageMutation,
  useGetPageQuery,
  useUpdatePageMutation,
} from '@/hooks/usePages'
import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  CubeIcon,
  PaintBrushIcon,
} from '@heroicons/react/16/solid'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import BuildConfigTab from '@/components/BuildConfigTab'
import BuildItemsTab from '@/components/BuildItemsTab'
import BuildThemingTab from '@/components/BuildThemingTab'
import BuildPagePreview from '@/components/BuildPagePreview'
import type { StatusItemType, StatusGroupType } from '@/types/common'
import type { TabItem } from '@/components/Tabs'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const buildTabs: TabItem[] = [
  { id: 'config', label: 'Config', icon: Cog6ToothIcon },
  { id: 'items', label: 'Items', icon: CubeIcon },
  { id: 'theming', label: 'Theming', icon: PaintBrushIcon },
]

const Build = () => {
  const { tenantId: tenantIdParam, pageId } = useParams<{
    tenantId?: string
    pageId?: string
  }>()
  const isEditMode = Boolean(pageId)

  const [tenantId, setTenantId] = useState<string>(tenantIdParam || '')
  const [name, setName] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [statusGroups, setStatusGroups] = useState<StatusGroupType[]>([])
  const [report, setReport] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [saved, setSaved] = useState(false)
  const [selectIcon, setSelectIcon] = useState('led')
  const [selectText, setSelectText] = useState('none')
  const [color, setColor] = useState('#FFFFFF')
  const [logo, setLogo] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [columns, setColumns] = useState('one')
  const [activeTab, setActiveTab] = useState<'config' | 'items' | 'theming'>(
    'config',
  )

  const savePageMutation = useSavePageMutation()
  const updatePageMutation = useUpdatePageMutation()
  const {
    data: pageData,
    isLoading: pageLoading,
    error: pageError,
  } = useGetPageQuery(tenantId || '', pageId || '')
  const groupsMutation = useGroupsMutation()

  const { data: tenantsData } = useGetUserTenants(1, 100, undefined, true)
  const { data: reportsData, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
    !!tenantId,
  )

  // Track next group ID to avoid duplicate names when groups are deleted
  const nextGroupIdRef = useRef(1)

  useEffect(() => {
    if (isEditMode && pageData) {
      setName(pageData.name || 'Untitled')
      setSlug(pageData.slug || 'untitled')
      setTitle(pageData.config?.title || '')
      setDesc(pageData.config?.description || '')
      setReport(reportsData?.find((r) => r.name === pageData.report)?.id || '')

      if (!tenantId) {
        setTenantId(pageData.tenant_id)
      }
      setStatusGroups(pageData.config?.groups || [])

      const existingGroups = pageData.config?.groups || []
      if (existingGroups.length > 0) {
        const maxId = existingGroups.reduce((max, group) => {
          const match = group.name.match(/^group-(\d+)$/)
          if (match) {
            const id = parseInt(match[1], 10)
            return id > max ? id : max
          }
          return max
        }, 0)
        nextGroupIdRef.current = maxId + 1
      }

      setSaved(true)
      setSelectIcon(pageData.config?.theming?.status.icon || 'led')
      setSelectText(pageData.config?.theming?.status.text || 'none')
      setColor(pageData.config?.theming?.color || '')
      setLogo(pageData.config?.theming?.logo || '')
      if (pageData.config?.theming?.logo) {
        setLogoPreview(pageData.config.theming.logo)
        if (!pageData.config.theming.logo.includes(BACKEND_API)) {
          setLogoUrl(pageData.config.theming.logo)
        }
      }
      setColumns(pageData.config?.theming?.columns || 'one')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    tenantId,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(pageData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(reportsData),
  ])

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

  const handleReportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReport(event.target.value)
  }

  const handlePageSave = () => {
    const data = {
      name,
      slug,
      tenant_id: tenantId,
      'report-id': report,
      config: {
        groups: statusGroups,
        title,
        description: desc,
        theming: {
          status: { icon: selectIcon, text: selectText },
          logo:
            logo &&
            (logo?.startsWith('http') || logo?.startsWith('data:')
              ? logo
              : `${BACKEND_API}${logo}`),
          color,
          columns,
        },
      },
    }

    if (isEditMode && pageId) {
      updatePageMutation.mutate(
        { tenantId, pageId, data },
        {
          onSuccess: () => {
            toast.success('Page updated successfully!')
            setSaved(true)
          },
          onError: (error: Error & { errors?: string[] }) => {
            if (error.errors && error.errors.length > 0) {
              toast.error(
                <div>
                  {error.errors?.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>,
              )
            } else {
              toast.error(`Failed to update status page: ${error.message}`)
            }
          },
        },
      )
    } else {
      savePageMutation.mutate(
        { tenantId, data },
        {
          onSuccess: () => {
            toast.success('Page created successfully!')
            setSaved(true)
          },
          onError: (error: Error & { errors?: string[] }) => {
            if (error.errors && error.errors.length > 0) {
              toast.error(
                <div>
                  {error.errors?.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>,
              )
            } else {
              toast.error(`Failed to create status page: ${error.message}`)
            }
          },
        },
      )
    }
  }

  useEffect(() => {
    if (!report && !tenantId && !groupsMutation.isPending)
      groupsMutation.mutate({ tenantId, reportId: report })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, tenantId])

  const handleTenantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTenantId(event.target.value)
    setReport('')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditMode) {
      setSlug(value.toLowerCase().replaceAll(' ', '-'))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replaceAll(' ', '-'))
  }

  const handleChangeItemAlias = (
    groupName: string,
    itemName: string,
    newAlias: string,
  ) => {
    if (groupName !== '') {
      setStatusGroups((prevStatusGroups) =>
        prevStatusGroups.map((group) =>
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

  const groupName = 'status-board'
  const [parent, items, setItems] = useDragAndDrop<
    HTMLUListElement,
    StatusItemType
  >([], { group: groupName, dragHandle: '.dnd-handle' })

  useEffect(() => {
    if (groupsMutation.data) setItems(groupsMutation.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(groupsMutation.data), setItems])

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

  // remembers each item's last position in the LEFT list
  const leftIndexRef = useRef<Map<string, number>>(new Map())

  // whenever LEFT list order changes, record indices for items currently present
  useEffect(() => {
    items.forEach((it, idx) => leftIndexRef.current.set(it.name, idx))
  }, [items])

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

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setLogoUrl(url)

    if (!url) {
      setLogoPreview(null)
      setLogo('')
      return
    }

    const isValidUrl = /^(https?:\/\/.+\..+|data:image\/.+;base64,.+)/.test(url)
    if (isValidUrl) {
      const img = new Image()
      img.onload = () => {
        setLogoPreview(url)
        setLogo(url)
      }
      img.onerror = () => {
        setLogoPreview(null)
        setLogo('')
      }
      img.src = url
    } else {
      setLogoPreview(null)
      setLogo('')
    }
  }

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLogoPreview(null)
    setLogoUrl('')
    setLogo('')
  }

  const handleLogoFileChange = (base64: string) => {
    setLogo(base64)
    setLogoPreview(base64)
  }

  if (isEditMode && pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="md" />
        <span className="ml-2">Loading page data...</span>
      </div>
    )
  }

  if (isEditMode && pageError) {
    return <ErrorDisplay error={pageError} context="page" />
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center px-6 md:px-0">
        <div className="page-container">
          <PageHeader
            title={isEditMode ? 'Edit Page' : 'Build New Page'}
            subtitle={
              isEditMode
                ? 'Update your status page configuration and content'
                : 'Create a new status page to monitor your services'
            }
            className="pb-1 mb-3"
          />

          <div className="flex flex-row justify-between items-center mb-6">
            <Tabs
              tabs={buildTabs}
              activeTab={activeTab}
              onChange={(id) =>
                setActiveTab(id as 'config' | 'items' | 'theming')
              }
            />
            <div className="flex justify-end gap-4">
              {saved && (
                <Button
                  variant="outline-primary"
                  size="md"
                  onClick={() => window.open(`/status/${slug}`, '_blank')}
                >
                  View Page
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </Button>
              )}
              {activeTab !== 'config' && (
                <Button variant="primary" size="md" onClick={handlePageSave}>
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              )}
            </div>
          </div>

          <div
            className={
              activeTab === 'config'
                ? ''
                : 'flex flex-col xl:grid xl:grid-cols-[500px_1fr] 2xl:grid-cols-[720px_1fr] gap-8'
            }
          >
            <div
              className={activeTab === 'config' ? 'max-w-4xl w-full' : 'w-full'}
            >
              <div className={activeTab === 'config' ? 'block pt-1' : 'hidden'}>
                <BuildConfigTab
                  name={name}
                  slug={slug}
                  tenantId={tenantId}
                  isEditMode={isEditMode}
                  tenantsData={tenantsData}
                  reportsData={reportsData}
                  onNameChange={handleNameChange}
                  onSlugChange={handleSlugChange}
                  onTenantChange={handleTenantChange}
                />
              </div>

              <div className={activeTab === 'items' ? 'block pt-1' : 'hidden'}>
                <BuildItemsTab
                  tenantId={tenantId}
                  report={report}
                  reportsData={reportsData}
                  reportsLoading={reportsLoading}
                  groupsMutationIsPending={groupsMutation.isPending}
                  groupsMutationData={groupsMutation.data}
                  parent={parent}
                  items={items}
                  statusGroups={statusGroups}
                  selectIcon={selectIcon}
                  selectText={selectText}
                  onReportChange={handleReportChange}
                />
              </div>

              <div
                className={activeTab === 'theming' ? 'block pt-1' : 'hidden'}
              >
                <BuildThemingTab
                  color={color}
                  logoUrl={logoUrl}
                  logoPreview={logoPreview}
                  selectIcon={selectIcon}
                  selectText={selectText}
                  columns={columns}
                  onColorChange={setColor}
                  onLogoUrlChange={handleLogoUrlChange}
                  onRemoveLogo={handleRemoveLogo}
                  onLogoFileChange={handleLogoFileChange}
                  onIconChange={setSelectIcon}
                  onTextChange={setSelectText}
                  onColumnsChange={setColumns}
                />
              </div>
            </div>

            {activeTab !== 'config' && (
              <BuildPagePreview
                color={color}
                logo={logo}
                title={title}
                desc={desc}
                statusGroups={statusGroups}
                groupName={groupName}
                columns={columns}
                selectIcon={selectIcon}
                selectText={selectText}
                report={report}
                groupsMutationIsPending={groupsMutation.isPending}
                onTitleChange={setTitle}
                onDescChange={setDesc}
                onUpdateGroup={updateGroup}
                onRenameGroup={renameGroup}
                onRemoveGroup={removeGroup}
                onChangeItemAlias={handleChangeItemAlias}
                onAddStatusGroup={handleAddStatusGroup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Build
