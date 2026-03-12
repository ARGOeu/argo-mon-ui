import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import {
  useGetUserTenantById,
  useGetUserTenantProjects,
  useAssignTenantProjectsMutation,
} from '@/hooks/useTenants'
import { useGetAllProjects } from '@/hooks/useProjects'
import { GripVertical } from 'lucide-react'
import type { ProjectItem } from '@/types/projects'
import { useAuth } from '@/auth/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const columnClass =
  'flex flex-col bg-white border border-line rounded-lg overflow-hidden'

const columnHeaderClass =
  'flex justify-between items-center px-5 py-3.5 bg-surface-strong border-b border-line'

const listContainerClass =
  'bg-surface-muted min-h-[300px] max-h-[400px] md:min-h-[400px] md:max-h-[500px] overflow-y-auto'

const AssignProjects = () => {
  const { profile } = useAuth()
  const { id: tenantId } = useParams<{ id: string }>()
  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const [allProjects, setAllProjects] = useState<ProjectItem[]>([])
  const [tenantProjectIds, setTenantProjectIds] = useState<string[]>([])
  const [availableProjects, setAvailableProjects] = useState<ProjectItem[]>([])
  const [assignedProjects, setAssignedProjects] = useState<ProjectItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: tenantData, error: tenantError } = useGetUserTenantById(
    tenantId || '',
  )

  const isReadOnly = !isSuperAdmin

  const groupName = 'projects-assignment'
  const [availableRef, availableItems, setAvailableItems] = useDragAndDrop<
    HTMLUListElement,
    ProjectItem
  >(availableProjects, {
    group: groupName,
    dragHandle: isReadOnly ? undefined : '.dnd-handle',
    disabled: isReadOnly,
  })

  const [assignedRef, assignedItems, setAssignedItems] = useDragAndDrop<
    HTMLUListElement,
    ProjectItem
  >(assignedProjects, {
    group: groupName,
    dragHandle: isReadOnly ? undefined : '.dnd-handle',
    disabled: isReadOnly,
  })

  const navigate = useNavigate()

  const {
    data: tenantProjectsData,
    fetchNextPage: fetchNextTenantProjectsPage,
    hasNextPage: hasNextTenantProjectsPage,
  } = useGetUserTenantProjects(tenantId || '')

  const {
    data: allProjectsData,
    fetchNextPage: fetchNextAllProjectsPage,
    hasNextPage: hasNextProjectsPage,
  } = useGetAllProjects(isSuperAdmin)

  const assignMutation = useAssignTenantProjectsMutation()

  // Fetch and gather all projects from all pages (only for super_admin)
  useEffect(() => {
    let projects: ProjectItem[] = []

    if (isSuperAdmin && allProjectsData?.pages) {
      allProjectsData.pages.forEach((page) => {
        projects = [
          ...projects,
          ...(page?.content
            ?.filter((p) => p.id)
            .map((p) => ({
              id: p.id!,
              name: p.name,
              start_date: p.start_date,
              end_date: p.end_date,
            })) || []),
        ]
      })
      if (hasNextProjectsPage) {
        fetchNextAllProjectsPage()
      }
    }

    setAllProjects(projects)
  }, [
    isSuperAdmin,
    allProjectsData,
    hasNextProjectsPage,
    fetchNextAllProjectsPage,
  ])

  // Fetch and gather all tenant project IDs from all pages
  useEffect(() => {
    let projectIds: string[] = []

    if (tenantProjectsData?.pages) {
      tenantProjectsData.pages.forEach((page) => {
        const ids =
          page?.content
            ?.map((tenant) => tenant.id)
            .filter((id): id is string => !!id) || []
        projectIds = [...projectIds, ...ids]
      })
      if (hasNextTenantProjectsPage) {
        fetchNextTenantProjectsPage()
      }
    }

    setTenantProjectIds(projectIds)
  }, [
    tenantProjectsData,
    hasNextTenantProjectsPage,
    fetchNextTenantProjectsPage,
  ])

  // Filter and set initial items when data is ready
  useEffect(() => {
    if (
      (isSuperAdmin ? !hasNextProjectsPage : true) &&
      !hasNextTenantProjectsPage
    ) {
      const assigned = allProjects?.filter((p) =>
        tenantProjectIds.includes(p.id),
      )
      const available = allProjects?.filter(
        (p) => !tenantProjectIds.includes(p.id),
      )

      setAssignedProjects(assigned)
      setAvailableProjects(available)

      setIsInitialized(true)
    }
  }, [
    isSuperAdmin,
    allProjects,
    tenantProjectIds,
    hasNextProjectsPage,
    hasNextTenantProjectsPage,
  ])

  // Sync drag-and-drop items when initial data changes
  useEffect(() => {
    if (isInitialized) {
      setAvailableItems(availableProjects)
    }
  }, [availableProjects, setAvailableItems, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      setAssignedItems(assignedProjects)
    }
  }, [assignedProjects, setAssignedItems, isInitialized])

  const handleSave = () => {
    if (!tenantId) return

    const projectIds = assignedItems.map((p) => p.id)

    assignMutation.mutate(
      { tenant_id: tenantId, project_ids: projectIds },
      {
        onSuccess: () => {
          toast.success('Projects assigned successfully!')
          setTimeout(() => {
            navigate('/administration#tenants')
          }, 2000)
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
            toast.error(`Failed to assign projects: ${error.message}`)
          }
        },
      },
    )
  }

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (tenantError) {
    return (
      <>
        <div className="page-container">
          <ErrorDisplay error={tenantError} context="tenant" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-container">
        <PageHeader
          title={
            isReadOnly ? 'View Assigned Projects' : 'Assign Projects to Tenant'
          }
          subtitle={
            <span>
              {isReadOnly
                ? 'Viewing projects assigned to tenant '
                : 'Drag and drop projects to assign or remove them from tenant '}
              <strong className="break-all">
                {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
              </strong>
            </span>
          }
          navigateTo={{
            label: 'Back to Tenants',
            to: '/administration#tenants',
          }}
        />

        {!isReadOnly && (
          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={
                assignMutation.isPending ||
                (availableItems.length === 0 && assignedItems.length === 0)
              }
            >
              {assignMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}

        <div
          className={`grid gap-6 ${isReadOnly ? 'max-w-[600px] mx-auto grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          {!isReadOnly && (
            <div className={columnClass}>
              <div className={columnHeaderClass}>
                <h2 className="font-semibold text-body m-0 tracking-wide">
                  Available Projects
                </h2>
                <span className="text-xs font-semibold text-muted bg-white px-2 py-1 rounded-md border border-line min-w-[1.75rem] text-center">
                  {availableItems.length}
                </span>
              </div>
              <div className={listContainerClass}>
                <ul
                  ref={availableRef}
                  className="list-none p-3 m-0 flex flex-col gap-2"
                >
                  {availableItems.length > 0 ? (
                    availableItems.map((project) => (
                      <li
                        key={project.id}
                        className="group px-4 py-2 bg-white border border-line rounded-md !cursor-grab transition-all flex items-center gap-3 shadow-sm hover:border-line-strong hover:shadow-md active:shadow-lg active:scale-[1.01]"
                      >
                        <div className="dnd-handle flex items-center gap-2 flex-grow-1">
                          <GripVertical className="w-[1.4rem] h-[1.4rem] text-subtle shrink-0 transition-colors group-hover:text-muted" />
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap tracking-[0.02rem]">
                              {project.name}
                            </span>
                            <span className="text-xs font-normal text-muted leading-[1.3]">
                              {formatDate(project.start_date)} -{' '}
                              {formatDate(project.end_date)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-8 px-4 text-center text-sm text-subtle border-2 border-dashed border-line rounded-md bg-white m-2">
                      No available projects
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div
            className={`${columnClass} ${isReadOnly ? 'col-span-full' : ''}`}
          >
            <div className={columnHeaderClass}>
              <h2 className="font-semibold text-body m-0 tracking-wide">
                Assigned Projects
              </h2>
              <span className="text-xs font-semibold text-muted bg-white px-2 py-1 rounded-md border border-line min-w-[1.75rem] text-center">
                {assignedItems.length}
              </span>
            </div>
            <div className={listContainerClass}>
              <ul
                ref={assignedRef}
                className="list-none p-3 m-0 flex flex-col gap-2"
              >
                {assignedItems.length > 0 ? (
                  assignedItems.map((project) => (
                    <li
                      key={project.id}
                      className={`group px-4 py-2 bg-white border border-line rounded-md transition-all flex items-center gap-3 shadow-sm ${isReadOnly ? '!cursor-default' : '!cursor-grab hover:border-line-strong hover:shadow-md active:shadow-lg active:scale-[1.01]'}`}
                    >
                      <div className="dnd-handle flex items-center gap-2 flex-grow-1">
                        {!isReadOnly && (
                          <GripVertical className="w-[1.4rem] h-[1.4rem] text-subtle shrink-0 transition-colors group-hover:text-muted" />
                        )}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap tracking-[0.02rem]">
                            {project.name}
                          </span>
                          <span className="text-xs font-normal text-muted leading-[1.3]">
                            {formatDate(project.start_date)} -{' '}
                            {formatDate(project.end_date)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-8 px-4 text-center text-sm text-subtle border-2 border-dashed border-line rounded-md bg-white m-2">
                    {isReadOnly
                      ? 'No projects assigned to this tenant'
                      : 'Drag projects here to assign'}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssignProjects
