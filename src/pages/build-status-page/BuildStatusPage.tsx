import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetTenantReports } from '@/hooks/useTenants'
import {
  useSavePageMutation,
  useGetPageQuery,
  useUpdatePageMutation,
} from '@/hooks/usePages'
import { useGroupsMutation } from '@/hooks/useGroups'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  CubeIcon,
  PaintBrushIcon,
} from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import BuildConfigTab from './BuildConfigTab'
import BuildItemsTab from './BuildItemsTab'
import BuildThemingTab from './BuildThemingTab'
import BuildPagePreview from './BuildPagePreview'
import { useBuildStatusPage } from './useBuildStatusPage'
import type { StatusItemType, StatusGroupType } from '@/types/common'
import type { ThemeOption } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI
const DND_GROUP = 'status-board'

const BuildStatusPage = () => {
  const { tenantId: tenantIdParam, pageId } = useParams<{
    tenantId?: string
    pageId?: string
  }>()

  const isEditMode = Boolean(pageId)
  const isTenantSelectionDisabled = isEditMode || Boolean(tenantIdParam)

  const [activeTab, setActiveTab] = useState<'config' | 'items' | 'theming'>(
    'config',
  )
  const [name, setName] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [tenantId, setTenantId] = useState<string>(tenantIdParam || '')
  const [report, setReport] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [selectIcon, setSelectIcon] = useState('led')
  const [selectText, setSelectText] = useState('none')
  const [themeOption, setThemeOption] = useState<ThemeOption>('theme_1')
  const [hasLogo, setHasLogo] = useState(false)
  const [color, setColor] = useState('#FFFFFF')
  const [logo, setLogo] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [columns, setColumns] = useState('one')
  const [statusGroups, setStatusGroups] = useState<StatusGroupType[]>([])
  const [saved, setSaved] = useState(false)
  // remembers each item's last position in the LEFT list
  const leftIndexRef = useRef<Map<string, number>>(new Map())

  const { tenants: tenantsData } = useSelectedTenant()
  const { data: reportsData, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
    !!tenantId,
  )
  const {
    data: pageData,
    isLoading: pageLoading,
    error: pageError,
  } = useGetPageQuery(tenantIdParam || '', pageId || '')

  const savePageMutation = useSavePageMutation()
  const updatePageMutation = useUpdatePageMutation()
  const groupsMutation = useGroupsMutation()

  const isSaving = savePageMutation.isPending || updatePageMutation.isPending
  const groupsMutationIsPending = groupsMutation.isPending
  const groupsMutationData = groupsMutation.data

  const [parent, items, setItems] = useDragAndDrop<
    HTMLUListElement,
    StatusItemType
  >([], { group: DND_GROUP, dragHandle: '.dnd-handle' })

  const {
    initGroups,
    triggerGroupsMutation,
    handlePageSave,
    handleAddStatusGroup,
    handleChangeItemAlias,
    updateGroup,
    renameGroup,
    removeGroup,
  } = useBuildStatusPage({
    isEditMode,
    pageId,
    statusGroups,
    setStatusGroups,
    setSaved,
    setItems,
    saveMutate: savePageMutation.mutate,
    updateMutate: updatePageMutation.mutate,
    groupsMutate: groupsMutation.mutate,
    leftIndexRef,
  })

  // whenever LEFT list order changes, record indices for items currently present
  useEffect(() => {
    items.forEach((it, idx) => leftIndexRef.current.set(it.name, idx))
  }, [items])

  useEffect(() => {
    if (groupsMutation.data) setItems(groupsMutation.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(groupsMutation.data), setItems])

  useEffect(() => {
    if (isEditMode && pageData) {
      setName(pageData.name || 'Untitled')
      setSlug(pageData.slug || 'untitled')
      setTitle(pageData.config?.title || '')
      setDesc(pageData.config?.description || '')
      setReport(reportsData?.find((r) => r.name === pageData.report)?.id || '')
      if (!tenantId) setTenantId(pageData.tenant_id)
      setSelectIcon(pageData.config?.theming?.status.icon || 'led')
      setSelectText(pageData.config?.theming?.status.text || 'none')
      setThemeOption(pageData.config?.theming?.option || 'theme_1')
      setHasLogo(
        pageData.config?.theming?.has_logo ?? !!pageData.config?.theming?.logo,
      )
      setColor(pageData.config?.theming?.color || '')
      setLogo(pageData.config?.theming?.logo || '')
      if (pageData.config?.theming?.logo) {
        setLogoPreview(pageData.config.theming.logo)
        if (!pageData.config.theming.logo.includes(BACKEND_API)) {
          setLogoUrl(pageData.config.theming.logo)
        }
      }
      setColumns(pageData.config?.theming?.columns || 'one')
      initGroups(pageData.config?.groups || [])
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

  useEffect(() => {
    if (report && tenantId && !groupsMutationIsPending)
      triggerGroupsMutation(tenantId, report)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, tenantId])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditMode) setSlug(value.toLowerCase().replaceAll(' ', '-'))
  }

  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replaceAll(' ', '-'))
  }

  const handleTenantChange = (value: string) => {
    setTenantId(value)
    setReport('')
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

  const onSave = () =>
    handlePageSave({
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
      hasLogo,
    })

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

          {isEditMode && pageLoading ? (
            <div className="loading-container">
              <LoadingSpinner size="md" />
            </div>
          ) : isEditMode && pageError ? (
            <ErrorDisplay error={pageError} context="page" />
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-6 mb-1 md:mb-4">
                <Tabs
                  tabs={[
                    {
                      id: 'config',
                      label: 'Config',
                      icon: Cog6ToothIcon,
                      hasError: !name.trim() || !slug.trim() || !tenantId,
                    },
                    {
                      id: 'items',
                      label: 'Items',
                      icon: CubeIcon,
                      hasError:
                        statusGroups.length === 0 ||
                        statusGroups.some((g) => g.list.length === 0),
                    },
                    {
                      id: 'theming',
                      label: 'Theming',
                      icon: PaintBrushIcon,
                      hasError: hasLogo && !logo,
                    },
                  ]}
                  activeTab={activeTab}
                  onChange={(id) =>
                    setActiveTab(id as 'config' | 'items' | 'theming')
                  }
                  className="flex-1 w-full"
                />
                <div className="flex justify-end gap-4 w-full md:w-auto 2xl:mr-25">
                  {saved && (
                    <Button
                      variant="outline-primary"
                      size="md"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/status/${slug}`,
                          '_blank',
                        )
                      }
                    >
                      View Page
                      <ArrowTopRightOnSquareIcon className="size-4 shrink-0" />
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-[3px] mb-3">
                <span className="inline-block size-[6px] rounded-full bg-red-500 shrink-0" />
                <span className="text-sm text-muted font-medium">:</span>
                <span className="text-sm text-subtle">
                  Indicates required fields are missing or invalid
                </span>
              </div>

              <div
                className={
                  activeTab === 'config'
                    ? ''
                    : 'flex flex-col xl:grid xl:grid-cols-[2fr_3fr] gap-8'
                }
              >
                <div
                  className={
                    activeTab === 'config' ? 'max-w-4xl w-full' : 'w-full'
                  }
                >
                  <div className={activeTab === 'config' ? 'block' : 'hidden'}>
                    <BuildConfigTab
                      name={name}
                      slug={slug}
                      tenantId={tenantId}
                      isEditMode={isEditMode}
                      isTenantSelectionDisabled={isTenantSelectionDisabled}
                      tenantsData={tenantsData}
                      reportsData={reportsData}
                      onNameChange={handleNameChange}
                      onSlugChange={handleSlugChange}
                      onTenantChange={handleTenantChange}
                    />
                  </div>

                  <div className={activeTab === 'items' ? 'block' : 'hidden'}>
                    <BuildItemsTab
                      tenantId={tenantId}
                      report={report}
                      reportsData={reportsData}
                      reportsLoading={reportsLoading}
                      groupsMutationIsPending={groupsMutationIsPending}
                      groupsMutationData={groupsMutationData}
                      parent={parent}
                      items={items}
                      statusGroups={statusGroups}
                      selectIcon={selectIcon}
                      selectText={selectText}
                      onReportChange={(value) => setReport(value)}
                    />
                  </div>

                  <div className={activeTab === 'theming' ? 'block' : 'hidden'}>
                    <BuildThemingTab
                      color={color}
                      hasLogo={hasLogo}
                      logoUrl={logoUrl}
                      logoPreview={logoPreview}
                      selectIcon={selectIcon}
                      selectText={selectText}
                      columns={columns}
                      themeOption={themeOption}
                      onColorChange={(v) => setColor(v)}
                      onHasLogoChange={(v) => setHasLogo(v)}
                      onLogoUrlChange={handleLogoUrlChange}
                      onRemoveLogo={handleRemoveLogo}
                      onLogoFileChange={handleLogoFileChange}
                      onIconChange={(v) => setSelectIcon(v)}
                      onTextChange={(v) => setSelectText(v)}
                      onColumnsChange={(v) => setColumns(v)}
                      onThemeOptionChange={(v) => setThemeOption(v)}
                    />
                  </div>
                </div>

                {activeTab !== 'config' && (
                  <BuildPagePreview
                    color={color}
                    logo={logo}
                    hasLogo={hasLogo}
                    title={title}
                    desc={desc}
                    statusGroups={statusGroups}
                    groupName={DND_GROUP}
                    columns={columns}
                    selectIcon={selectIcon}
                    selectText={selectText}
                    report={report}
                    themeOption={themeOption}
                    groupsMutationIsPending={groupsMutationIsPending}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildStatusPage
