import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CubeIcon,
  PaintBrushIcon,
  PhotoIcon,
} from '@heroicons/react/16/solid'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useReportsMutation } from '@/hooks/useReports'
import { useGroupsMutation } from '@/hooks/useGroups'
import type {
  DataSource,
  StatusItemType,
  StatusGroupType,
} from '@/types/common'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import StatusGroup from '@/components/StatusGroup'
import { getStatusClass } from '@/utils/status'
import { StatusItem } from '@/components/StatusItem'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import EditLabel from '@/components/EditLabel'
import { useAuth } from '@/auth/useAuth'
import { fetchEncrypted } from '@/api/data'
import {
  useSavePageMutation,
  useGetPageQuery,
  useUpdatePageMutation,
} from '@/hooks/usePages'
import { toast, Toaster } from 'sonner'
import SelectGroup from '@/components/SelectGroup'
import { BanIcon, Columns2Icon, SquareIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/Button'
import { LoginPrompt } from '@/components/LoginPrompt'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const Build = () => {
  const { token, authenticated, login } = useAuth()
  const { id: editId } = useParams<{ id?: string }>()
  const isEditMode = Boolean(editId)

  const [dataSource, setDataSource] = useState<DataSource>({
    api: '',
    secret: '',
  })

  const [isEncrypted, setIsEncrypted] = useState(false)
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
  const [columns, setColumns] = useState('one')
  const [activeTab, setActiveTab] = useState<'config' | 'items' | 'theming'>(
    'config',
  )

  const savePageMutation = useSavePageMutation()
  const updatePageMutation = useUpdatePageMutation(editId || '')
  const getPageQuery = useGetPageQuery(editId || '')
  const groupsMutation = useGroupsMutation()
  const [filterItems, setFilterItems] = useState('')
  const reportsMutation = useReportsMutation()

  // Load existing page data in edit mode
  useEffect(() => {
    if (isEditMode && getPageQuery.data) {
      const pageData = getPageQuery.data
      // Populate form with existing data
      setName(pageData.name || 'Untitled')
      setSlug(pageData.slug || 'untitled')
      setTitle(pageData.config?.title || '')
      setDesc(pageData.config?.description || '')
      setDataSource({
        api: pageData.api || '',
        secret: pageData.secret || '',
      })
      setReport(pageData.report || '')
      setStatusGroups(pageData.config?.groups || [])
      setSaved(true) // Already saved since we're editing
      setSelectIcon(pageData.config?.theming?.status.icon || 'led')
      setSelectText(pageData.config?.theming?.status.text || 'none')
      setColor(pageData.config?.theming?.color || '')
      setLogo(pageData.config?.theming?.logo || '')
      setColumns(pageData.config?.theming?.columns || 'one')

      // If we have data source info, automatically connect
      if (pageData.api && pageData.secret && !reportsMutation.isPending) {
        setIsEncrypted(true) // Assume stored secrets are encrypted
        reportsMutation.mutate({
          api: pageData.api,
          secret: pageData.secret,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, JSON.stringify(getPageQuery.data)])

  const handleAddStatusGroup = () => {
    setStatusGroups((prev) => [
      ...prev,
      {
        name: `group-${prev.length + 1}`,
        alias: `group-${prev.length + 1}`,
        list: [],
      },
    ])
  }

  const handleReportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReport(event.target.value)
  }

  const handlePageSave = () => {
    const pageData = {
      name: name,
      slug: slug,
      api: dataSource.api,
      secret: dataSource.secret,
      report: report,

      config: {
        groups: statusGroups,
        title: title,
        description: desc,
        theming: {
          status: {
            icon: selectIcon,
            text: selectText,
          },
          logo:
            logo &&
            (logo?.startsWith('http') || logo?.startsWith('data:')
              ? logo
              : `${BACKEND_API}${logo}`),
          color: color,
          columns: columns,
        },
      },
    }

    if (isEditMode && editId) {
      // Update existing page
      updatePageMutation.mutate(pageData, {
        onSuccess: () => {
          toast.success('Page Updated!')
          setSaved(true)
        },
        onError: (error) => {
          toast.error(`${error}`)
        },
      })
    } else {
      // Create new page
      savePageMutation.mutate(pageData, {
        onSuccess: () => {
          toast.success('Page Saved!')
          setSaved(true)
        },
        onError: (error) => {
          toast.error(`${error}`)
        },
      })
    }
  }

  useEffect(() => {
    if (report !== '' && !groupsMutation.isPending)
      groupsMutation.mutate({ ...dataSource, report: report })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, dataSource])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reportsMutation.isSuccess) {
      reportsMutation.reset()
      setDataSource({ api: '', secret: '' })
      setIsEncrypted(false)
    } else {
      if (!isEncrypted) {
        const encrypted = await fetchEncrypted(dataSource.secret, token || '')
        setDataSource({ ...dataSource, secret: encrypted || '' })
        setIsEncrypted(true)
        reportsMutation.mutate({ api: dataSource.api, secret: encrypted })
      } else {
        reportsMutation.mutate(dataSource)
      }
    }
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target
    setDataSource((prev) => ({
      ...prev,
      [name]: value,
    }))
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

  const fl = filterItems.trim().toLowerCase()

  // this is the left column of loaded api items
  const groupName = 'status-board'
  const [parent, items, setItems] = useDragAndDrop<
    HTMLUListElement,
    StatusItemType
  >([], { group: groupName, dragHandle: '.dnd-handle' })

  useEffect(() => {
    if (groupsMutation.data) setItems(groupsMutation.data)
  }, [groupsMutation.data, setItems])

  const groupsFiltered =
    fl !== ''
      ? items.filter((item) =>
          `${item.name} ${item.status}`.toLowerCase().includes(fl),
        )
      : items

  // update column
  const updateGroup = (groupIndex: number, nextItems: StatusItemType[]) => {
    setStatusGroups((prev) => {
      const movedNames = new Set(nextItems.map((it) => it.name))

      const next = prev.map((g, i) =>
        i === groupIndex
          ? { ...g, list: nextItems } // keep original status
          : { ...g, list: g.list.filter((it) => !movedNames.has(it.name)) },
      )

      // remove moved items from the left list
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

  /** remembers each item's last position in the LEFT list */
  const leftIndexRef = useRef<Map<string, number>>(new Map())

  /** whenever LEFT list order changes, record indices for items currently present */
  useEffect(() => {
    items.forEach((it, idx) => leftIndexRef.current.set(it.name, idx))
  }, [items])

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        toast.error('Only PNG and JPEG image formats are supported')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = event.target.result as string
          setLogo(base64String)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
  })

  // Show loading spinner while loading page data
  if (isEditMode && getPageQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin size-8" />
        <span className="ml-2">Loading page data...</span>
      </div>
    )
  }

  // Show error if page failed to load
  if (isEditMode && getPageQuery.isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">
          Failed to load page: {getPageQuery.error?.message}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <LoginPrompt
        title="Build Status Pages"
        description="Login to create and customize your status pages"
        onLogin={login}
      />
    )
  }

  return (
    <div>
      <Toaster richColors position="top-center" />
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-7xl w-full">
          <div className="pb-1 mb-3">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Page' : 'Build New Page'}
              </h1>
              <p className="text-md text-gray-500">
                {isEditMode
                  ? 'Update your status page configuration and content'
                  : 'Create a new status page to monitor your services'}
              </p>
            </div>
          </div>

          <div
            className={
              activeTab === 'config'
                ? 'flex flex-row justify-between items-center max-w-4xl'
                : 'grid grid-cols-[minmax(400px,600px)_1fr] gap-6 items-center'
            }
          >
            <div className="custom-tabs">
              <button
                className={`custom-tab ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <Cog6ToothIcon className="size-5" />
                Config
              </button>
              <button
                className={`custom-tab ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                <CubeIcon className="size-5" />
                Items
              </button>
              <button
                className={`custom-tab ${activeTab === 'theming' ? 'active' : ''}`}
                onClick={() => setActiveTab('theming')}
              >
                <PaintBrushIcon className="size-5" />
                Theming
              </button>
            </div>

            <div className="flex justify-end gap-4 max-w-2xl">
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
              <Button variant="primary" size="md" onClick={handlePageSave}>
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          <div
            className={
              activeTab === 'config'
                ? ''
                : 'grid grid-cols-[minmax(400px,600px)_1fr] gap-8'
            }
          >
            <div
              className={activeTab === 'config' ? 'max-w-4xl w-full' : 'w-full'}
            >
              <div
                className={`custom-tab-content ${activeTab === 'config' ? 'active' : ''}`}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-[320px_1fr] gap-6 items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Page Settings</h3>
                      <p className="text-sm text-gray-500">
                        Basic information for your status page.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Enter page name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            if (!isEditMode) {
                              setSlug(
                                e.target.value
                                  .toLowerCase()
                                  .replaceAll(' ', '-'),
                              )
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Path <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Enter page path"
                          value={slug}
                          onChange={(e) => {
                            setSlug(
                              e.target.value.toLowerCase().replaceAll(' ', '-'),
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[320px_1fr] gap-6 items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Data Source</h3>
                      <p className="text-sm text-gray-500">
                        Connect to your Argo-web-api endpoint.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Argo-web-api endpoint (URL):
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="https://"
                          name="api"
                          value={dataSource.api}
                          onChange={handleInputChange}
                          disabled={reportsMutation.isSuccess}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Access Token:
                        </label>
                        <input
                          type="password"
                          className="input w-full"
                          placeholder="s3cr3t"
                          name="secret"
                          value={dataSource.secret}
                          onChange={handleInputChange}
                          disabled={reportsMutation.isSuccess}
                        />
                      </div>

                      <button
                        className="btn btn-outline w-full mt-2"
                        onClick={handleSubmit}
                      >
                        {reportsMutation.isPending ? (
                          <>
                            <ArrowPathIcon className="animate-spin size-4" />
                            <span>Connecting ...</span>
                          </>
                        ) : reportsMutation.data ? (
                          'Clear Connection'
                        ) : (
                          'Connect'
                        )}
                      </button>

                      {reportsMutation.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                          Error: {reportsMutation.error.message}
                        </div>
                      )}
                      {reportsMutation.isSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center">
                          <CheckBadgeIcon className="size-5 inline-block me-2" />
                          Connected successfully
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Tab Content */}
              <div
                className={`custom-tab-content ${activeTab === 'items' ? 'active ' : ''}`}
              >
                <div className="space-y-4">
                  <div>
                    <div className="border border-gray-200 rounded-lg px-5 py-4 space-y-3">
                      <h3 className="text-lg font-semibold mb-0">
                        Report Selection
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Choose a report and manage items.
                      </p>
                      {!reportsMutation.data && (
                        <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded mt-6">
                          Connect to a data source in the Config tab to load
                          reports
                        </div>
                      )}

                      {reportsMutation.data && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Report:
                            </label>
                            <select
                              value={report}
                              className="select w-full"
                              onChange={handleReportChange}
                              disabled={statusGroups.length > 0}
                            >
                              <option value="" disabled={true}>
                                Select a report
                              </option>
                              {reportsMutation.data.map((item) => (
                                <option key={item.name} value={item.name}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {groupsMutation.isPending && (
                            <div className="p-2 text-base mt-2 mx-auto">
                              <ArrowPathIcon className="size-4 animate-spin inline-block me-2" />{' '}
                              Loading items...
                            </div>
                          )}

                          {groupsMutation.data &&
                            (groupsMutation.data.length === 0 ? (
                              <div className="text-sm text-red-500 p-2 mt-2 bg-red-50 border-red-400 border text-center rounded">
                                Report is empty!
                              </div>
                            ) : (
                              <>
                                <div className="mb-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Items:
                                  </label>
                                  <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Search..."
                                    name="filter"
                                    value={filterItems}
                                    onChange={(e) => {
                                      setFilterItems(e.target.value)
                                    }}
                                  />
                                </div>
                                <div className="text-sm text-gray-400 rounded-lg p-1 mt-2 mb-1">
                                  Drag and drop items to the preview panel to
                                  add them to a group
                                </div>
                                <div className="max-h-[500px] overflow-y-auto border border-gray-200 rounded px-4 py-1">
                                  <ul ref={parent}>
                                    {(groupsFiltered ?? []).map((group) => (
                                      <li key={group.name} className="my-2">
                                        <StatusItem
                                          iconMode={selectIcon}
                                          textMode={selectText}
                                          group=""
                                          drag={true}
                                          dragHandle="dnd-handle"
                                          name={group.name}
                                          alias={group.alias || ''}
                                          status={group.status}
                                          onChangeAlias={() => {}}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theming Tab Content */}
              <div
                className={`custom-tab-content ${activeTab === 'theming' ? 'active' : ''}`}
              >
                <div className="space-y-4">
                  <div>
                    <div className="border border-gray-200 rounded-lg px-5 py-4 space-y-3">
                      <h3 className="text-lg font-semibold mb-0">
                        Customize Appearance
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Customize colors, logo, and status display options.
                      </p>
                      <div className="bg-white rounded-lg py-2 space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color:
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="input flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo:
                          </label>
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors ${
                              isDragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            <input {...getInputProps()} />
                            {logo ? (
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  alt="Logo"
                                  className="h-12 w-auto object-contain"
                                  src={
                                    logo?.startsWith('http') ||
                                    logo?.startsWith('data:')
                                      ? logo
                                      : `${BACKEND_API}${logo}`
                                  }
                                />
                                <p className="text-xs text-gray-500">
                                  Click or drag to change
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="text-gray-400 mb-1">
                                  <PhotoIcon className="mx-auto h-10 w-10" />
                                </div>
                                <p className="text-sm text-gray-500">
                                  {isDragActive
                                    ? 'Drop logo here'
                                    : 'Drop logo here or click to upload'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Icon:
                          </label>
                          <SelectGroup
                            selected={selectIcon}
                            onChange={setSelectIcon}
                          >
                            <SelectGroup.Item value="led">
                              <div
                                aria-label="status"
                                className="status status-lg status-success"
                              ></div>
                              <div>Led</div>
                            </SelectGroup.Item>
                            <SelectGroup.Item value="icon">
                              <CheckCircleIcon className="text-green-500 size-4" />
                              <div>Icon</div>
                            </SelectGroup.Item>
                          </SelectGroup>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Text:
                          </label>
                          <SelectGroup
                            selected={selectText}
                            onChange={setSelectText}
                          >
                            <SelectGroup.Item value="text">
                              <div className="text-green-500">
                                <small>OK</small>
                              </div>
                              <div>Text</div>
                            </SelectGroup.Item>
                            <SelectGroup.Item value="badge">
                              <div className="badge badge-success text-white">
                                <small>OK</small>
                              </div>
                              <div>Badge</div>
                            </SelectGroup.Item>
                            <SelectGroup.Item value="none">
                              <BanIcon className="w-4" />
                              <div>None</div>
                            </SelectGroup.Item>
                          </SelectGroup>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Columns:
                          </label>
                          <SelectGroup selected={columns} onChange={setColumns}>
                            <SelectGroup.Item value="one">
                              <SquareIcon className="w-4" />
                              <div>One</div>
                            </SelectGroup.Item>
                            <SelectGroup.Item value="two">
                              <Columns2Icon className="w-4" />
                              <div>Two</div>
                            </SelectGroup.Item>
                          </SelectGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeTab !== 'config' && (
              <div className="border border-gray-200 rounded-lg p-4 shadow-md w-full max-w-2xl self-start">
                <header
                  style={{ backgroundColor: color }}
                  className="p-3 mb-2 rounded-lg"
                >
                  <div className="flex flex-col items-center">
                    {logo && (
                      <img
                        src={
                          logo?.startsWith('http') || logo?.startsWith('data:')
                            ? logo
                            : `${BACKEND_API}${logo}`
                        }
                        className="my-2 h-20 w-auto object-contain"
                        alt="Logo"
                      />
                    )}
                    <div className="flex flex-row items-center gap-3 mb-1">
                      <EditLabel
                        label={title}
                        onChange={(title) => setTitle(title)}
                        size="text-3xl"
                        placeholder="Add a title"
                      />
                    </div>
                    <EditLabel
                      label={desc}
                      onChange={(desc) => setDesc(desc)}
                      size="text-base"
                      textArea={true}
                      placeholder="Add a description"
                      color="#6a7282"
                    />
                  </div>
                </header>
                <div>
                  {statusGroups.map((col, index) => (
                    <StatusGroup
                      key={col.name}
                      name={col.name}
                      alias={col.alias || ''}
                      items={col.list}
                      group={groupName}
                      columns={columns}
                      getStatusClass={getStatusClass}
                      onItemsChange={(next) => updateGroup(index, next)}
                      onRename={(nextName) => renameGroup(index, nextName)}
                      onRemove={() => removeGroup(index)}
                      onChangeAlias={handleChangeItemAlias}
                      iconMode={selectIcon}
                      textMode={selectText}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-center mt-6">
                    <div
                      className={!report ? 'tooltip' : ''}
                      data-tip={
                        !report
                          ? 'Please select a report first to add groups'
                          : ''
                      }
                    >
                      <Button
                        disabled={!report || reportsMutation.isPending}
                        onClick={handleAddStatusGroup}
                        variant="outline-secondary"
                      >
                        Click here to Add a new Group
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
