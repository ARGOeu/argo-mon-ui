import { useState, useEffect } from 'react'
import { useGetProjects, useDeleteProjectMutation } from '@/hooks/useProjects'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ConfirmDialog from '@/components/ConfirmDialog'
import SearchInput from '@/components/SearchInput'
import Pagination from '@/components/Pagination'
import Card from '@/components/Card'
import { toast } from 'sonner'

const pageSize = 9

const actionIconClass = 'size-4 min-[840px]:size-5'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const ProjectManagementTab = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const {
    data,
    isLoading,
    error: projectsError,
  } = useGetProjects(currentPage, pageSize, searchQuery)
  const deleteMutation = useDeleteProjectMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDeleteClick = (id: string, name: string) => {
    setProjectToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return

    deleteMutation.mutate(projectToDelete.id, {
      onSuccess: () => {
        toast.success('Project deleted successfully!')
        setDeleteDialogOpen(false)
        setProjectToDelete(null)

        if (data?.content && data.content.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1)
        }
      },
      onError: (error) => {
        toast.error(`Failed to delete project: ${error.message}`)
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  return (
    <>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Project"
        message={
          projectToDelete ? (
            <>
              Are you sure you want to delete project{' '}
              <strong>{projectToDelete.name}</strong> ?
              <br />
              <span className="text-amber-600 font-medium">
                This action cannot be undone.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <SearchInput
          className="min-w-[24rem]"
          value={searchInput}
          onChange={setSearchInput}
          onClear={handleClearSearch}
          placeholder="Search projects..."
          maxWidth="max-w-md"
        />
        <Button variant="primary" size="md" href="/projects/create">
          Create New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : projectsError ? (
        <ErrorDisplay error={projectsError} context="projects" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {data?.content && data.content.length > 0
            ? data.content.map((project) => (
                <Card
                  key={project.id}
                  footer={
                    <>
                      <IconButton
                        label="Edit Project"
                        icon={<PencilSquareIcon className={actionIconClass} />}
                        href={`/projects/edit/${project.id}`}
                        className="text-muted hover:bg-gray-200"
                      />
                      <IconButton
                        label="Delete Project"
                        icon={<TrashIcon className={actionIconClass} />}
                        onClick={() =>
                          handleDeleteClick(project.id!, project.name)
                        }
                        className="text-red-600 hover:bg-red-50"
                      />
                    </>
                  }
                >
                  <div className="py-2 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-xl font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap"
                        title={project.name}
                      >
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted min-w-[150px]">
                          Start Date:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(project.start_date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted min-w-[150px]">
                          End Date:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(project.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted min-w-[150px]">
                          Sustainability End Date:
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(project.sustainability_end_date)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 mb-1 pt-2 border-t border-gray-100">
                      <div className="text-sm font-medium text-muted min-w-[150px]">
                        Data Retention Policy:
                      </div>
                      <p
                        className="text-sm font-medium text-muted line-clamp-2 leading-relaxed"
                        title={project.data_retention_policy}
                      >
                        {project.data_retention_policy}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            : null}
        </div>
      )}

      {!projectsError &&
      !isLoading &&
      (!data || data?.content?.length === 0) ? (
        <div className="text-center p-8 bg-surface-muted rounded-lg border border-line">
          <p className="text-muted text-lg">No projects found</p>
        </div>
      ) : null}

      {data?.content && data.content.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.total_pages}
          totalElements={data.total_elements}
          itemLabel="projects"
          className="py-1 my-4"
          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(data.total_pages, prev + 1))
          }
        />
      )}
    </>
  )
}

export default ProjectManagementTab
