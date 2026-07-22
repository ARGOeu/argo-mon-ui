import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useGetDowntime,
  useCreateDowntimeMutation,
  useUpdateDowntimeMutation,
} from '@/hooks/useDowntimes'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import ServicesPicker from './ServicesPicker'
import { useCanManageDowntimes } from './useCanManageDowntimes'
import type {
  DowntimeRequest,
  DowntimeSeverity,
  DowntimeServiceRequest,
} from '@/types/downtimes'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 md:gap-12 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-3 flex flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-body mb-1'

const severityOptions: { value: DowntimeSeverity; label: string }[] = [
  { value: 'Outage', label: 'Outage' },
  { value: 'Warning', label: 'Warning' },
]

const toDatetimeLocalUTC = (isoString?: string) => {
  if (!isoString) {
    return ''
  }
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

const fromDatetimeLocalUTCToISO = (value: string) => {
  if (!value) {
    return ''
  }
  return `${value}:00Z`
}

const CreateDowntime = () => {
  const { id: tenantId, downtimeId } = useParams<{
    id: string
    downtimeId?: string
  }>()
  const isEditMode = Boolean(downtimeId)
  const navigate = useNavigate()

  const { canManage, isResolved: permissionsResolved } = useCanManageDowntimes()

  useEffect(() => {
    if (permissionsResolved && !canManage && tenantId) {
      navigate(`/tenants/${tenantId}/downtimes`, { replace: true })
    }
  }, [permissionsResolved, canManage, tenantId, navigate])

  const [formData, setFormData] = useState<{
    name: string
    severity: DowntimeSeverity
    message: string
    scheduled_at: string
    completed_at: string
  }>({
    name: '',
    severity: 'Outage',
    message: '',
    scheduled_at: '',
    completed_at: '',
  })
  const [validationError, setValidationError] = useState('')
  const [services, setServices] = useState<DowntimeServiceRequest[]>([])

  const {
    data: downtimeData,
    isLoading: isDowntimeLoading,
    error: downtimeError,
  } = useGetDowntime(tenantId ?? '', downtimeId ?? '', isEditMode)

  useEffect(() => {
    if (isEditMode && downtimeData) {
      setFormData({
        name: downtimeData.name || '',
        severity: downtimeData.severity || 'Outage',
        message: downtimeData.message || '',
        scheduled_at: toDatetimeLocalUTC(downtimeData.scheduled_at),
        completed_at: toDatetimeLocalUTC(downtimeData.completed_at),
      })
      setServices(
        downtimeData.services.map((s) => ({
          hostname: s.hostname,
          service: s.service,
        })),
      )
    }
  }, [isEditMode, downtimeData])

  const createMutation = useCreateDowntimeMutation()
  const updateMutation = useUpdateDowntimeMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      formData.scheduled_at &&
      formData.completed_at &&
      formData.completed_at <= formData.scheduled_at
    ) {
      setValidationError('Completed At must be later than Scheduled At')
      return
    }

    if (!tenantId) {
      return
    }

    const data: DowntimeRequest = {
      name: formData.name,
      severity: formData.severity,
      scheduled_at: fromDatetimeLocalUTCToISO(formData.scheduled_at),
      completed_at: fromDatetimeLocalUTCToISO(formData.completed_at),
      services,
    }
    if (formData.message.trim()) {
      data.message = formData.message
    }

    if (isEditMode && downtimeId) {
      updateMutation.mutate(
        { tenantId, downtimeId, data },
        {
          onSuccess: () => {
            toast.success('Downtime updated successfully!')
            navigate(`/tenants/${tenantId}/downtimes`)
          },
          onError: (error: Error & { errors?: string[] }) => {
            if (error.errors && error.errors.length > 0) {
              toast.error(
                <div>
                  {error.errors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>,
              )
            } else {
              toast.error(`Failed to update downtime: ${error.message}`)
            }
          },
        },
      )
    } else {
      createMutation.mutate(
        { tenantId, data },
        {
          onSuccess: () => {
            toast.success('Downtime created successfully!')
            navigate(`/tenants/${tenantId}/downtimes`)
          },
          onError: (error: Error & { errors?: string[] }) => {
            if (error.errors && error.errors.length > 0) {
              toast.error(
                <div>
                  {error.errors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>,
              )
            } else {
              toast.error(`Failed to create downtime: ${error.message}`)
            }
          },
        },
      )
    }
  }

  const isFormValid =
    formData.name.trim() &&
    formData.severity &&
    formData.scheduled_at &&
    formData.completed_at &&
    services.length > 0

  return (
    <div className="page-container mb-4">
      {isEditMode && isDowntimeLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : isEditMode && downtimeError ? (
        <ErrorDisplay error={downtimeError} context="downtime" />
      ) : (
        <>
          <PageHeader
            title={isEditMode ? 'Edit Downtime' : 'Create Downtime'}
            subtitle={
              isEditMode
                ? 'Update the scheduled maintenance details'
                : 'Schedule a new planned maintenance'
            }
            navigateTo={{
              label: 'Back to Downtimes',
              to: `/tenants/${tenantId}/downtimes`,
            }}
          />

          <div className="flex justify-end mb-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div className={sectionClass}>
              <div className="pt-2 pl-2">
                <h2 className="section-title">Downtime Information</h2>
                <p className="section-description">
                  Details of the scheduled maintenance window
                </p>
              </div>

              <div className={sectionContentClass}>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter downtime name"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Severity <span className="required">*</span>
                  </label>
                  <SelectDropdown
                    value={formData.severity}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        severity: value as DowntimeSeverity,
                      }))
                    }
                    options={severityOptions}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the maintenance"
                    rows={2}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Scheduled At (UTC) <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    onChange={handleChange}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Completed At (UTC) <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="completed_at"
                    value={formData.completed_at}
                    onChange={handleChange}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                  />
                  {validationError && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationError}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mt-0.5">
                  <label className={labelClass}>
                    Services <span className="required">*</span>
                  </label>
                  <ServicesPicker
                    tenantId={tenantId ?? ''}
                    selected={services}
                    onChange={setServices}
                  />
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default CreateDowntime
