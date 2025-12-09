import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectById,
} from '@/hooks/useProjects'
import { toast, Toaster } from 'sonner'
import Button from '../components/Button'
import styles from './CreateTenant.module.css'

const CreateProject = () => {
  const { id: projectId } = useParams<{ id?: string }>()
  const isEditMode = Boolean(projectId)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    sustainability_end_date: '',
    data_retention_policy: '',
  })

  const [validationErrors, setValidationErrors] = useState({
    end_date: '',
    sustainability_end_date: '',
  })

  const createMutation = useCreateProjectMutation()
  const updateMutation = useUpdateProjectMutation()
  const { data: projectData, isLoading: isProjectLoading } = useGetProjectById(
    projectId || '',
  )

  // Load project data in edit mode
  useEffect(() => {
    if (isEditMode && projectData) {
      // Convert ISO string to date format (YYYY-MM-DD)
      const formatToDate = (isoString: string) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      setFormData({
        name: projectData.name || '',
        start_date: formatToDate(projectData.start_date),
        end_date: formatToDate(projectData.end_date),
        sustainability_end_date: formatToDate(
          projectData.sustainability_end_date,
        ),
        data_retention_policy: projectData.data_retention_policy || '',
      })
    }
  }, [isEditMode, projectData])

  const validateDates = () => {
    const errors = { end_date: '', sustainability_end_date: '' }
    let isValid = true

    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    const sustainabilityEndDate = new Date(formData.sustainability_end_date)

    // Validate end_date is later than start_date
    if (formData.end_date && formData.start_date && endDate <= startDate) {
      errors.end_date = 'End date must be later than start date'
      isValid = false
    }

    // Validate sustainability_end_date is later than start_date
    if (
      formData.sustainability_end_date &&
      formData.start_date &&
      sustainabilityEndDate < startDate
    ) {
      errors.sustainability_end_date =
        'Sustainability end date must be equal to or later than start date'
      isValid = false
    }

    // Validate sustainability_end_date is equal to or later than end_date
    if (
      formData.sustainability_end_date &&
      formData.end_date &&
      sustainabilityEndDate < endDate
    ) {
      errors.sustainability_end_date =
        'Sustainability end date must be equal to or later than end date'
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate dates before submitting
    if (!validateDates()) {
      return
    }

    const formatToISO = (dateString: string, endOfDay = false) => {
      if (!dateString) return ''
      const time = endOfDay ? 'T23:59:59Z' : 'T00:00:00Z'
      return new Date(dateString + time).toISOString()
    }

    const submitData = {
      name: formData.name,
      start_date: formatToISO(formData.start_date, false),
      end_date: formatToISO(formData.end_date, true),
      sustainability_end_date: formatToISO(
        formData.sustainability_end_date,
        true,
      ),
      data_retention_policy: formData.data_retention_policy,
    }

    if (isEditMode && projectId) {
      // Update existing project
      updateMutation.mutate(
        { id: projectId, data: submitData },
        {
          onSuccess: () => {
            toast.success('Project updated successfully!')
            setTimeout(() => {
              navigate(`/projects/view`)
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
              toast.error(`Failed to update project: ${error.message}`)
            }
          },
        },
      )
    } else {
      // Create new project
      createMutation.mutate(submitData, {
        onSuccess: () => {
          toast.success('Project created successfully!')
          setTimeout(() => {
            navigate(`/projects/view`)
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
            toast.error(`Failed to create project: ${error.message}`)
          }
        },
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error when user starts typing
    if (name === 'end_date' || name === 'sustainability_end_date') {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <div className={styles.container}>
        {isEditMode && isProjectLoading ? (
          <div className="loading-container">
            <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <h1 className="page-title">
                  {isEditMode ? 'Edit Project' : 'Create New Project'}
                </h1>
                <p className="page-subtitle">
                  {isEditMode
                    ? 'Update the project information'
                    : 'Fill in the details to create a new project'}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !formData.name.trim() ||
                  !formData.start_date ||
                  !formData.end_date ||
                  !formData.sustainability_end_date ||
                  !formData.data_retention_policy.trim()
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update'
                    : 'Create'}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.section}>
                <div className={styles['section-info']}>
                  <h2 className="section-title">Project Information</h2>
                  <p className="section-description">
                    Basic information for the project
                  </p>
                </div>

                <div className={styles['section-content']}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Project Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      disabled={isEditMode}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Start Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      End Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      required
                    />
                    {validationErrors.end_date && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.end_date}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Sustainability End Date{' '}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="sustainability_end_date"
                      value={formData.sustainability_end_date}
                      onChange={handleChange}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      required
                    />
                    {validationErrors.sustainability_end_date && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.sustainability_end_date}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Data Retention Policy <span className="required">*</span>
                    </label>
                    <textarea
                      name="data_retention_policy"
                      value={formData.data_retention_policy}
                      onChange={handleChange}
                      placeholder="Enter data retention policy"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
}

export default CreateProject
