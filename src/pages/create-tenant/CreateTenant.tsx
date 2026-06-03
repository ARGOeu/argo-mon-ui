import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateTenantMutation,
  useGetUserTenantById,
  useUpdateUserTenantMutation,
} from '@/hooks/useTenants'
import type { Metadata } from '@/types/tenants'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import ContactInformation from './ContactInformation'
import InfrastructureMetadata from './InfrastructureMetadata'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import TenantBasicInfoTab from './TenantBasicInfoTab'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const CreateTenant = () => {
  const { id: tenantId } = useParams<{ id?: string }>()
  const isEditMode = Boolean(tenantId)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    image: '',
  })
  const [contacts, setContacts] = useState([{ name: '', email: '', type: '' }])
  const [metadata, setMetadata] = useState({
    ui_url: '',
    poem_url: '',
    internalLists: [{ email: '', type: '' }],
    auth_name: '',
    auth_url: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'metadata'>(
    'info',
  )
  const [errors, setErrors] = useState({ name: '', email: '', website: '' })
  const [hasContactValidationError, setHasContactValidationError] =
    useState(false)
  const [hasMetadataValidationError, setHasMetadataValidationError] =
    useState(false)

  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      clearTimeout(navigateTimerRef.current ?? undefined)
    }
  }, [])

  const createMutation = useCreateTenantMutation()
  const updateMutation = useUpdateUserTenantMutation()

  const {
    data: tenantData,
    isLoading: isTenantLoading,
    error: tenantError,
  } = useGetUserTenantById(tenantId || '')

  useEffect(() => {
    if (isEditMode && tenantData) {
      setFormData({
        name: tenantData.info.name || '',
        email: tenantData.info.email || '',
        description: tenantData.info.description || '',
        website: tenantData.info.website || '',
        image: tenantData.info.image || '',
      })

      if (tenantData.info.image) {
        setImagePreview(tenantData.info.image)
        if (!tenantData.info.image.includes(BACKEND_API)) {
          setImageUrl(tenantData.info.image)
        }
      }

      if (tenantData.contacts && tenantData.contacts.length > 0) {
        setContacts(
          tenantData.contacts.map((contact) => ({
            name: contact.name || '',
            email: contact.email || '',
            type: contact.type || '',
          })),
        )
      }

      if (tenantData.metadata) {
        const loadedInternalLists =
          tenantData.metadata.internalLists &&
          tenantData.metadata.internalLists.length > 0
            ? tenantData.metadata.internalLists.map((list) => ({
                email: list.email || '',
                type: list.type || '',
              }))
            : [{ email: '', type: '' }]

        setMetadata({
          ui_url: tenantData.metadata.instance?.ui_url || '',
          poem_url: tenantData.metadata.instance?.poem_url || '',
          internalLists: loadedInternalLists,
          auth_name: tenantData.metadata.auth_metadata?.auth_name || '',
          auth_url: tenantData.metadata.auth_metadata?.auth_url || '',
        })
      }
    }
  }, [isEditMode, tenantData])

  const hasTenantDetailsErrors = () => {
    return (
      !!errors.name ||
      !!errors.email ||
      !!errors.website ||
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.description.trim()
    )
  }

  const hasContactErrors = () => {
    return contacts.some(
      (contact) =>
        !contact.name.trim() ||
        !contact.email.trim() ||
        !contact.type ||
        hasContactValidationError,
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData =
      formData.image || imageUrl
        ? { ...formData, image: formData.image || imageUrl }
        : { ...formData, image: undefined }

    const contactsData = contacts
      .filter((contact) => contact.name.trim() && contact.email.trim())
      .map((contact) => ({
        name: contact.name,
        email: contact.email,
        type: contact.type || undefined,
      }))

    const metadataObj: Metadata = {}

    const hasInstanceData = metadata.ui_url.trim() || metadata.poem_url.trim()

    if (hasInstanceData) {
      metadataObj.instance = {}

      if (metadata.ui_url.trim()) metadataObj.instance.ui_url = metadata.ui_url
      if (metadata.poem_url.trim())
        metadataObj.instance.poem_url = metadata.poem_url
    }

    const internalListsData = metadata.internalLists
      .filter((list) => list.email.trim() && list.type)
      .map((list) => ({
        email: list.email || undefined,
        type: list.type || undefined,
      }))

    if (internalListsData.length > 0)
      metadataObj.internalLists = internalListsData

    if (metadata?.auth_name || metadata?.auth_url) {
      metadataObj.auth_metadata = {
        auth_name: metadata.auth_name || undefined,
        auth_url: metadata.auth_url || undefined,
      }
    }

    const onError = (error: Error & { errors?: string[] }) => {
      if (error.errors && error.errors.length > 0) {
        toast.error(
          <div>
            {error.errors?.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>,
        )
      } else {
        toast.error(
          `Failed to ${isEditMode ? 'update' : 'create'} tenant: ${error.message}`,
        )
      }
    }

    if (isEditMode && tenantId) {
      updateMutation.mutate(
        {
          id: tenantId,
          data: {
            info: submitData,
            contacts: contactsData,
            metadata: metadataObj,
          },
        },
        {
          onSuccess: () => {
            toast.success('Tenant updated successfully!')
            navigateTimerRef.current = setTimeout(
              () => navigate(`/tenants/${tenantId}/details`),
              2000,
            )
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(
        { info: submitData, contacts: contactsData, metadata: metadataObj },
        {
          onSuccess: (createdTenant) => {
            toast.success('Tenant created successfully!')
            navigateTimerRef.current = setTimeout(
              () =>
                navigate(
                  createdTenant.id
                    ? `/tenants/${createdTenant.id}/details`
                    : `/administration#tenants`,
                ),
              2000,
            )
          },
          onError,
        },
      )
    }
  }

  return (
    <div className="page-container">
      {isEditMode && isTenantLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : isEditMode && tenantError ? (
        <ErrorDisplay error={tenantError} context="tenant" />
      ) : (
        <>
          <PageHeader
            title={isEditMode ? 'Edit Tenant' : 'Create New Tenant'}
            subtitle={
              isEditMode ? (
                <>
                  Update information for tenant
                  <strong className="break-all">
                    {tenantData?.info.name ? ` ${tenantData.info.name}` : ''}
                  </strong>
                </>
              ) : (
                'Fill in the details to create a new tenant'
              )
            }
            className="mb-1 pb-1"
            navigateTo={{
              label: isEditMode ? 'Back to Overview' : 'Back to Tenants',
              to: isEditMode
                ? `/tenants/${tenantId}/details`
                : '/administration#tenants',
            }}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[3px]">
              <span className="inline-block size-[6px] rounded-full bg-red-500 shrink-0" />
              <span className="text-sm text-muted font-medium">:</span>
              <span className="text-sm text-subtle">
                Indicates required fields are missing or invalid
              </span>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !!errors.name ||
                !!errors.email ||
                !!errors.website ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.description.trim() ||
                !contacts.some(
                  (contact) =>
                    contact.name.trim() &&
                    contact.email.trim() &&
                    contact.type.trim(),
                ) ||
                hasContactValidationError ||
                hasMetadataValidationError
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update'
                  : 'Create'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <Tabs
              tabs={[
                {
                  id: 'info',
                  label: 'Tenant Details',
                  hasError: hasTenantDetailsErrors(),
                },
                {
                  id: 'contact',
                  label: 'Contact Information',
                  hasError: hasContactErrors(),
                },
                {
                  id: 'metadata',
                  label: 'Infrastructure Settings',
                  hasError: hasMetadataValidationError,
                },
              ]}
              activeTab={activeTab}
              onChange={(id) =>
                setActiveTab(id as 'info' | 'contact' | 'metadata')
              }
            />

            <div className={activeTab === 'info' ? 'block' : 'hidden'}>
              <TenantBasicInfoTab
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                isEditMode={isEditMode}
              />
            </div>

            <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
              <ContactInformation
                contacts={contacts}
                onContactsChange={setContacts}
                onValidationChange={setHasContactValidationError}
                initialData={tenantData?.contacts || null}
              />
            </div>

            <div className={activeTab === 'metadata' ? 'block' : 'hidden'}>
              <InfrastructureMetadata
                metadata={metadata}
                onMetadataChange={setMetadata}
                onValidationChange={setHasMetadataValidationError}
              />
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default CreateTenant
