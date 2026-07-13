import { useState, useEffect, useRef } from 'react'
import {
  useGetSettingById,
  useUpdateSettingMutation,
} from '@/hooks/useSettings'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-3'

const urlRegex = /^https?:\/\/.+\..+$/
const BASE_URL_FIELD = 'base.url'
const initialFormState = { [BASE_URL_FIELD]: '', enabled: false }

const PerformanceSettings = () => {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState(initialFormState)
  const [baseline, setBaseline] = useState(initialFormState)
  const [errors, setErrors] = useState({ [BASE_URL_FIELD]: '' })
  const initializedForId = useRef<string | null>(null)

  const { data: setting, isLoading, error } = useGetSettingById(id ?? '')
  const updateSettingMutation = useUpdateSettingMutation()

  useEffect(() => {
    if (setting && id && initializedForId.current !== id) {
      const currentUrl = setting.data?.config?.[BASE_URL_FIELD]
      const initial = {
        [BASE_URL_FIELD]: typeof currentUrl === 'string' ? currentUrl : '',
        enabled: setting.enabled,
      }
      setFormData(initial)
      setBaseline(initial)
      initializedForId.current = id
    }
  }, [setting, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === BASE_URL_FIELD) {
      if (value && !urlRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [BASE_URL_FIELD]:
            'Please enter a valid URL (must start with http:// or https://)',
        }))
      } else {
        setErrors((prev) => ({ ...prev, [BASE_URL_FIELD]: '' }))
      }
    }
  }

  const handleEnabledChange = (enabled: boolean) => {
    setFormData((prev) => ({ ...prev, enabled }))
  }

  const isValid =
    formData[BASE_URL_FIELD].trim() !== '' &&
    urlRegex.test(formData[BASE_URL_FIELD]) &&
    !errors[BASE_URL_FIELD]

  const isDirty =
    formData[BASE_URL_FIELD] !== baseline[BASE_URL_FIELD] ||
    formData.enabled !== baseline.enabled

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!id || !setting || !isValid || !isDirty) {
      return
    }

    updateSettingMutation.mutate(
      {
        id,
        payload: {
          data: {
            config: {
              [BASE_URL_FIELD]: formData[BASE_URL_FIELD].trim(),
            },
          },
          enabled: formData.enabled,
        },
      },
      {
        onSuccess: () => {
          toast.success('Performance settings saved successfully')
          setBaseline(formData)
        },
        onError: (err: Error) => {
          toast.error(`Failed to save performance settings: ${err.message}`)
        },
      },
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={setting?.data.label || 'Performance View'}
        subtitle={
          setting?.data.description ||
          'Configure the Grafana instance used to embed tenant performance dashboards'
        }
        className="mb-1 pb-1"
        navigateTo={{ label: 'Back to Settings', to: '/settings' }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="performance settings" />
      ) : !setting ? (
        <ErrorDisplay
          error="Setting not found"
          context="performance settings"
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={updateSettingMutation.isPending || !isValid || !isDirty}
            >
              {updateSettingMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div className={sectionClass}>
              <div className="pt-2 pl-2">
                <h2 className="section-title">Grafana configuration</h2>
                <p className="section-description">
                  Enable and configure the hosted Grafana service
                </p>
              </div>

              <div className={sectionContentClass}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-brand"
                    checked={formData.enabled}
                    onChange={() => handleEnabledChange(!formData.enabled)}
                  />
                  <p className="text-sm font-semibold text-body">
                    {formData.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </label>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-body mb-1">
                    Grafana base URL <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    name={BASE_URL_FIELD}
                    value={formData[BASE_URL_FIELD]}
                    onChange={handleChange}
                    placeholder="Enter Grafana base URL"
                    required
                  />
                  {errors[BASE_URL_FIELD] && (
                    <span className="text-red-400 text-sm mt-1">
                      {errors[BASE_URL_FIELD]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default PerformanceSettings
