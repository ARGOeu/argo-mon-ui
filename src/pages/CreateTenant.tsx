import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { ArrowPathIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/16/solid'
import {
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useGetTenantById,
} from '@/hooks/useTenants'
import { toast, Toaster } from 'sonner'
import Button from '../components/Button'
import styles from './CreateTenant.module.css'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

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
  const [contact, setContact] = useState({
    name: '',
    email: '',
    type: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [websiteError, setWebsiteError] = useState('')
  const [contactEmailError, setContactEmailError] = useState('')

  const createMutation = useCreateTenantMutation()
  const updateMutation = useUpdateTenantMutation()
  const { data: tenantData, isLoading: isTenantLoading } = useGetTenantById(
    tenantId || '',
  )

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
      if (tenantData.contacts && tenantData.contacts.length > 0) {
        setContact({
          name: tenantData.contacts[0].name || '',
          email: tenantData.contacts[0].email || '',
          type: tenantData.contacts[0].type || '',
        })
      }
      if (tenantData.info.image) {
        setImagePreview(tenantData.info.image)
        if (!tenantData.info.image.includes(BACKEND_API)) {
          setImageUrl(tenantData.info.image)
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData =
      formData.image || imageUrl
        ? { ...formData, image: formData.image || imageUrl }
        : { ...formData, image: undefined }

    const contacts =
      contact.name.trim() && contact.email.trim()
        ? [
            {
              name: contact.name,
              email: contact.email,
              type: contact.type || undefined,
            },
          ]
        : []

    if (isEditMode && tenantId) {
      // Update existing tenant
      updateMutation.mutate(
        { id: tenantId, data: { info: submitData, contacts } },
        {
          onSuccess: () => {
            toast.success('Tenant updated successfully!')
            setTimeout(() => {
              navigate(`/tenants/view`)
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
        { info: submitData, contacts },
        {
          onSuccess: () => {
            toast.success('Tenant created successfully!')
            setTimeout(() => {
              navigate(`/tenants/view`)
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'name') {
      // Allow only Latin uppercase letters (A-Z), spaces, and hyphen
      const isValid = /^[A-Z\s-]*$/.test(value)
      if (value && !isValid) {
        setNameError(
          'Only Latin uppercase letters, spaces, and hyphen (-) are allowed',
        )
      } else {
        setNameError('')
      }
    }

    if (name === 'email') {
      // Email validation
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }

    if (name === 'website') {
      // URL validation - must start with http:// or https://
      const urlRegex = /^https?:\/\/.+\..+/
      if (value && !urlRegex.test(value)) {
        setWebsiteError(
          'Please enter a valid URL (must start with http:// or https://)',
        )
      } else {
        setWebsiteError('')
      }
    }
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setContact((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'email') {
      if (value && !emailRegex.test(value)) {
        setContactEmailError('Please enter a valid email address')
      } else {
        setContactEmailError('')
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
      <Toaster richColors position="top-center" duration={2000} />
      <div className={styles.container}>
        {isEditMode && isTenantLoading ? (
          <div className="loading-container">
            <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <h1 className="page-title">
                  {isEditMode ? 'Edit Tenant' : 'Create New Tenant'}
                </h1>
                <p className="page-subtitle">
                  {isEditMode
                    ? 'Update the tenant information'
                    : 'Fill in the details to create a new tenant'}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !!nameError ||
                  !!emailError ||
                  !!websiteError ||
                  !!contactEmailError ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.description.trim() ||
                  Boolean(contact.name.trim() && !contact.email.trim()) ||
                  Boolean(!contact.name.trim() && contact.email.trim())
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
                  <h2 className="section-title">Tenant Information</h2>
                  <p className="section-description">
                    Basic details and identification
                  </p>
                </div>

                <div className={styles['section-content']}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter tenant name"
                      required
                    />
                    {nameError && (
                      <span className="text-red-400 text-sm mt-1">
                        {nameError}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="The email of the tenant that is responsible"
                      required
                    />
                    {emailError && (
                      <span className="text-red-400 text-sm mt-1">
                        {emailError}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Description <span className="required">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={styles.textarea}
                      placeholder="A small description about the tenant"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles['section-info']}>
                  <h2 className="section-title">Contact Information</h2>
                  <p className="section-description">
                    Contact details for the tenant
                  </p>
                </div>

                <div className={styles['section-content']}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Contact Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contact.name}
                      onChange={handleContactChange}
                      className={styles.input}
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Contact Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={handleContactChange}
                      className={styles.input}
                      placeholder="Enter contact email"
                    />
                    {contactEmailError && (
                      <span className="text-red-400 text-sm mt-1">
                        {contactEmailError}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Contact Type</label>
                    <input
                      type="text"
                      name="type"
                      value={contact.type}
                      onChange={handleContactChange}
                      className={styles.input}
                      placeholder="Enter contact type (e.g., Admin, Operations, Security)"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles['section-info']}>
                  <h2 className="section-title">Additional Details</h2>
                  <p className="section-description">
                    Optional media and website links
                  </p>
                </div>

                <div className={styles['section-content']}>
                  <div className={styles.field}>
                    <label className={styles.label}>Image</label>
                    <div
                      {...getRootProps()}
                      className={`${styles.dropzone} ${isDragActive ? styles['dropzone-active'] : ''}`}
                    >
                      <input {...getInputProps()} />
                      {imagePreview ? (
                        <div className={styles['image-preview']}>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className={styles['remove-image-button']}
                            aria-label="Remove image"
                          >
                            <XMarkIcon className={styles['remove-icon']} />
                          </button>
                          <img
                            className={styles['preview-image']}
                            src={imagePreview}
                          />
                          <p className={styles['dropzone-text']}>
                            Drop image here or click to upload
                          </p>
                        </div>
                      ) : (
                        <>
                          <PhotoIcon className={styles['upload-icon']} />
                          <p className={styles['upload-text']}>
                            {isDragActive
                              ? 'Drop image here'
                              : 'Drop image here or click to upload'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles['or-divider']}>
                      <span>OR</span>
                    </div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                      className={styles.input}
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div className={`${styles.field} mt-2`}>
                    <label className={styles.label}>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter the project related URL"
                    />
                    {websiteError && (
                      <span className="text-red-400 text-sm mt-1">
                        {websiteError}
                      </span>
                    )}
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

export default CreateTenant
