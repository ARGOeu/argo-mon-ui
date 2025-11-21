import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon } from '@heroicons/react/16/solid'
import { useCreateTenantMutation } from '@/hooks/useTenants'
import { toast, Toaster } from 'sonner'
import { Button } from '../components/Button'
import styles from './CreateTenant.module.css'

export const CreateTenant = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    image: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [websiteError, setWebsiteError] = useState('')

  const createMutation = useCreateTenantMutation()
  const navigate = useNavigate()

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
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (nameError || emailError || websiteError) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const submitData = {
      ...formData,
      image: formData.image || imageUrl || undefined,
    }

    createMutation.mutate(
      { info: submitData },
      {
        onSuccess: () => {
          toast.success('Tenant created successfully!')
          setTimeout(() => {
            navigate('/tenants')
          }, 2000)
        },
        onError: (error) => {
          toast.error(`Failed to create tenant: ${error.message}`)
        },
      },
    )
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    if (url) {
      setImagePreview(url)
      setFormData((prev) => ({ ...prev, image: url }))
    }
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className="page-title">Create New Tenant</h1>
            <p className="page-subtitle">
              Fill in the details to create a new tenant
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={
              createMutation.isPending ||
              !!nameError ||
              !!emailError ||
              !!websiteError
            }
          >
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <div className={styles['section-info']}>
              <h2 className="section-title">Tenant Information</h2>
              <p className="section-description">
                Basic information for the new tenant
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
                  <span className="text-red-400 text-sm mt-1">{nameError}</span>
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
              <h2 className="section-title">Additional Details</h2>
              <p className="section-description">
                Optional information for the tenant
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
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={styles['preview-image']}
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
      </div>
    </>
  )
}
