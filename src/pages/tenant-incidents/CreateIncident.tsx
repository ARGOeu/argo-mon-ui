import { useMemo, useState } from 'react'
import { useCreateIncidentMutation } from '@/hooks/useIncidents'
import { useGetTopologyGroups } from '@/hooks/useTopology'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import { useCanManageIncidents } from './useCanManageIncidents'
import type { IncidentRequest } from '@/types/incidents'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 md:gap-12 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-3'
const labelClass = 'text-sm font-medium text-body mb-1'

const CreateIncident = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { canManage, isResolved: permissionsResolved } = useCanManageIncidents()

  const [formData, setFormData] = useState({ title: '', description: '' })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceSearch, setServiceSearch] = useState('')

  const {
    data: groups,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGetTopologyGroups(tenantId ?? '')

  const serviceOptions = useMemo(() => {
    const subgroups = new Set(
      (groups ?? []).map((group) => group.subgroup).filter(Boolean),
    )
    return Array.from(subgroups).sort((a, b) => a.localeCompare(b))
  }, [groups])

  const filteredServiceOptions = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase()
    if (!query) {
      return serviceOptions
    }
    return serviceOptions.filter((service) =>
      service.toLowerCase().includes(query),
    )
  }, [serviceOptions, serviceSearch])

  const createMutation = useCreateIncidentMutation()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    )
  }

  const handleRemoveService = (service: string) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenantId) {
      return
    }

    const data: IncidentRequest = {
      title: formData.title,
      description: formData.description,
      services: selectedServices.map((name) => ({ id: name, name })),
    }

    createMutation.mutate(
      { tenantId, data },
      {
        onSuccess: () => {
          toast.success('Incident reported successfully!')
          navigate(`/tenants/${tenantId}/incidents`)
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
            toast.error(`Failed to report incident: ${error.message}`)
          }
        },
      },
    )
  }

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    selectedServices.length > 0

  return (
    <div className="page-container mb-8">
      <PageHeader
        title="Report Incident"
        subtitle="Report a new incident affecting a service"
        navigateTo={{
          label: 'Back to Incidents',
          to: `/tenants/${tenantId}/incidents`,
        }}
      />

      {!permissionsResolved ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : !canManage ? (
        <div className="my-8">
          <ErrorDisplay error="Forbidden" context="page" />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !isFormValid}
            >
              {createMutation.isPending ? 'Reporting...' : 'Report Incident'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div className={sectionClass}>
              <div className="pt-2 pl-2">
                <h2 className="section-title">Incident Information</h2>
                <p className="section-description">
                  Details of the incident being reported
                </p>
              </div>

              <div className={sectionContentClass}>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter incident title"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what is down or not working properly"
                    rows={2}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    Affected service groups <span className="required">*</span>
                  </label>

                  <div className="flex flex-col gap-2">
                    {selectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedServices.map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center gap-1 bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-full"
                          >
                            <span className="truncate max-w-32">{service}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(service)}
                              className="text-brand/70 hover:text-brand-strong hover:bg-brand/20 rounded-full p-px transition-colors cursor-pointer shrink-0"
                              aria-label={`Remove ${service}`}
                            >
                              <XMarkIcon className="size-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <SearchInput
                      value={serviceSearch}
                      onChange={setServiceSearch}
                      onClear={() => setServiceSearch('')}
                      placeholder="Search service groups"
                      className="!mb-0"
                    />

                    <div className="border border-line-strong rounded-lg bg-white max-h-60 overflow-y-auto">
                      {isGroupsLoading ? (
                        <div className="flex justify-center py-6">
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : groupsError ? (
                        <p className="text-sm text-red-600 px-4 py-3">
                          Failed to load services
                        </p>
                      ) : !filteredServiceOptions.length ? (
                        <p className="text-sm text-subtle italic px-4 py-3">
                          No services found
                        </p>
                      ) : (
                        filteredServiceOptions.map((service) => {
                          const isChecked = selectedServices.includes(service)
                          return (
                            <label
                              key={service}
                              className={`flex items-center gap-3 px-3 py-1.5 border-b border-line last:border-b-0 cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-brand-subtle'
                                  : 'hover:bg-surface-muted'
                              }`}
                            >
                              <div
                                className={`relative size-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-brand border-brand'
                                    : 'border-line-strong bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isChecked}
                                  onChange={() => handleToggleService(service)}
                                />
                                {isChecked && (
                                  <CheckIcon className="size-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm text-foreground break-all">
                                {service}
                              </span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default CreateIncident
