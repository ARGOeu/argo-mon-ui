import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/16/solid'
import {
  useCreateTenantMutation,
  useGetUserTenantById,
  useUpdateUserTenantMutation,
} from '@/hooks/useTenants'
import type { Metadata } from '@/types/tenants'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import ContactInformation from '../components/ContactInformation'
import InfrastructureMetadata from '../components/InfrastructureMetadata'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-2.5'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const [contacts, setContacts] = useState([
    {
      name: '',
      email: '',
      type: '',
    },
  ])
  const [metadata, setMetadata] = useState({
    ui_url: '',
    poem_url: '',
    topology_type: '',
    topology_url: '',
    topology_feed: '',
    internalLists: [{ email: '', type: '' }],
    auth_name: '',
    auth_url: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'metadata'>(
    'info',
  )
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    website: '',
  })
  const [hasContactValidationError, setHasContactValidationError] =
    useState(false)
  const [hasMetadataValidationError, setHasMetadataValidationError] =
    useState(false)

  const createMutation = useCreateTenantMutation()
  const updateMutation = useUpdateUserTenantMutation()

  const {
    data: tenantData,
    isLoading: isTenantLoading,
    error: tenantError,
  } = useGetUserTenantById(tenantId || '')

  // Load tenant data in edit mode
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
          topology_type: tenantData.metadata.instance?.topology?.type || '',
          topology_url: tenantData.metadata.instance?.topology?.url || '',
          topology_feed: tenantData.metadata.instance?.topology?.feed || '',
          internalLists: loadedInternalLists,
          auth_name: tenantData.metadata.auth_metadata?.auth_name || '',
          auth_url: tenantData.metadata.auth_metadata?.auth_url || '',
        })
      }
    }
  }, [isEditMode, tenantData])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported')
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
        setFormData((prev) => ({ ...prev, image: base64String }))
        setImagePreview(base64String)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
  })

  // Validation helpers for tab indicators
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

  const hasMetadataErrors = () => {
    return hasMetadataValidationError
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

    // Check if any instance fields have values
    const hasInstanceData =
      metadata.ui_url.trim() ||
      metadata.poem_url.trim() ||
      metadata.topology_type.trim() ||
      metadata.topology_url.trim() ||
      metadata.topology_feed.trim()

    if (hasInstanceData) {
      metadataObj.instance = {}

      if (metadata.ui_url.trim()) {
        metadataObj.instance.ui_url = metadata.ui_url
      }

      if (metadata.poem_url.trim()) {
        metadataObj.instance.poem_url = metadata.poem_url
      }

      // Check if any topology fields have values
      const hasTopologyData =
        metadata.topology_type.trim() ||
        metadata.topology_url.trim() ||
        metadata.topology_feed.trim()

      if (hasTopologyData) {
        metadataObj.instance.topology = {}

        if (metadata.topology_type.trim()) {
          metadataObj.instance.topology.type = metadata.topology_type
        }

        if (metadata.topology_url.trim()) {
          metadataObj.instance.topology.url = metadata.topology_url
        }

        if (metadata.topology_feed.trim()) {
          metadataObj.instance.topology.feed = metadata.topology_feed
        }
      }
    }

    const internalListsData = metadata.internalLists
      .filter((list) => list.email.trim() && list.type)
      .map((list) => ({
        email: list.email || undefined,
        type: list.type || undefined,
      }))

    if (internalListsData.length > 0) {
      metadataObj.internalLists = internalListsData
    }

    if (metadata?.auth_name || metadata?.auth_url) {
      metadataObj.auth_metadata = {
        auth_name: metadata.auth_name || undefined,
        auth_url: metadata.auth_url || undefined,
      }
    }

    if (isEditMode && tenantId) {
      // Update existing tenant
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
            setTimeout(() => {
              navigate(`/tenants`)
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
              toast.error(`Failed to update tenant: ${error.message}`)
            }
          },
        },
      )
    } else {
      // Create new tenant
      createMutation.mutate(
        { info: submitData, contacts: contactsData, metadata: metadataObj },
        {
          onSuccess: () => {
            toast.success('Tenant created successfully!')
            setTimeout(() => {
              navigate(`/tenants`)
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
              toast.error(`Failed to create tenant: ${error.message}`)
            }
          },
        },
      )
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target

    if (name === 'name') {
      // Capitalize and filter to only allow Latin letters (a-z, A-Z), numbers (0-9), spaces, and hyphen
      const hasInvalidChars = /[^a-zA-Z0-9\s-]/.test(value)
      const sanitizedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase()

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }))

      if (hasInvalidChars) {
        setErrors((prev) => ({
          ...prev,
          name: 'Only Latin uppercase letters, numbers, spaces, and hyphen (-) are allowed',
        }))
      } else {
        setErrors((prev) => ({ ...prev, name: '' }))
      }
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'email') {
      // Email validation
      if (value && !emailRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          email: 'Please enter a valid email address',
        }))
      } else {
        setErrors((prev) => ({ ...prev, email: '' }))
      }
    }

    if (name === 'website') {
      // URL validation - must start with http:// or https://
      const urlRegex = /^https?:\/\/.+\..+/
      if (value && !urlRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          website:
            'Please enter a valid URL (must start with http:// or https://)',
        }))
      } else {
        setErrors((prev) => ({ ...prev, website: '' }))
      }
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)

    if (!url) {
      // Clear preview if URL is empty
      setImagePreview(null)
      setFormData((prev) => ({ ...prev, image: '' }))
      return
    }

    const isValidUrl = /^(https?:\/\/.+\..+|data:image\/.+;base64,.+)/.test(url)

    if (isValidUrl) {
      // Test if image can actually load
      const img = new Image()
      img.onload = () => {
        setImagePreview(url)
        setFormData((prev) => ({ ...prev, image: url }))
      }
      img.onerror = () => {
        setImagePreview(null)
        setFormData((prev) => ({ ...prev, image: '' }))
      }
      img.src = url
    } else {
      // Clear preview if URL format is invalid
      setImagePreview(null)
      setFormData((prev) => ({ ...prev, image: '' }))
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImagePreview(null)
    setImageUrl('')
    setFormData((prev) => ({ ...prev, image: '' }))
  }

  return (
    <>
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
              navigateTo={{ label: 'Back to Tenants', to: '/tenants' }}
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
                    hasError: hasMetadataErrors(),
                  },
                ]}
                activeTab={activeTab}
                onChange={(id) =>
                  setActiveTab(id as 'info' | 'contact' | 'metadata')
                }
              />

              <div className={activeTab === 'info' ? 'block' : 'hidden'}>
                <div className={sectionClass}>
                  <div className="pt-2 pl-2">
                    <h2 className="section-title">Tenant Information</h2>
                    <p className="section-description">
                      Basic details and identification
                    </p>
                  </div>

                  <div className={sectionContentClass}>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-body mb-1">
                        Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter tenant name"
                        disabled={isEditMode}
                        required
                      />
                      {errors.name && (
                        <span className="text-red-400 text-sm mt-1">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-body mb-1">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="The email of the tenant that is responsible"
                        required
                      />
                      {errors.email && (
                        <span className="text-red-400 text-sm mt-1">
                          {errors.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-body mb-1">
                        Description <span className="required">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="A small description about the tenant"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="pt-2 pl-2">
                    <h2 className="section-title">Additional Details</h2>
                    <p className="section-description">
                      Optional media and website links
                    </p>
                  </div>

                  <div className={sectionContentClass}>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-body mb-1">
                        Image
                      </label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-all min-h-[80px] flex flex-col items-center justify-center ${isDragActive ? 'border-blue-500 bg-brand-muted' : 'border-line-strong bg-white hover:border-gray-400 hover:bg-surface-strong'}`}
                      >
                        <input {...getInputProps()} />
                        {imagePreview ? (
                          <div className="flex flex-col items-center gap-1 w-full relative">
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-0 right-0 bg-gray-600 border-2 border-white rounded-full size-7 flex items-center justify-center cursor-pointer z-10 shadow-md hover:bg-gray-700 hover:shadow-lg"
                              aria-label="Remove image"
                            >
                              <XMarkIcon className="size-5 text-white" />
                            </button>
                            <img
                              className="size-20 rounded-lg object-contain"
                              src={imagePreview}
                            />
                            <p className="text-sm text-muted m-0">
                              Drop image here or click to upload
                            </p>
                          </div>
                        ) : (
                          <>
                            <PhotoIcon className="size-12 text-subtle mx-auto mb-0.5" />
                            <p className="text-sm text-muted m-0">
                              {isDragActive
                                ? 'Drop image here'
                                : 'Drop image here or click to upload'}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center my-1">
                        <div className="flex-1 border-b border-line" />
                        <span className="px-4 text-xs text-subtle font-medium uppercase">
                          OR
                        </span>
                        <div className="flex-1 border-b border-line" />
                      </div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="flex flex-col mt-2">
                      <label className="text-sm font-medium text-body mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter the project related URL"
                      />
                      {errors.website && (
                        <span className="text-red-400 text-sm mt-1">
                          {errors.website}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                  initialData={tenantData?.metadata || null}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
}

export default CreateTenant
