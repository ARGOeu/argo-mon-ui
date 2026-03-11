import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-2.5'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormData {
  name: string
  email: string
  description: string
  website: string
  image: string
}

interface FormErrors {
  name: string
  email: string
  website: string
}

interface TenantBasicInfoTabProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  imageUrl: string
  setImageUrl: React.Dispatch<React.SetStateAction<string>>
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
  isEditMode: boolean
}

const TenantBasicInfoTab = ({
  formData,
  setFormData,
  errors,
  setErrors,
  imageUrl,
  setImageUrl,
  imagePreview,
  setImagePreview,
  isEditMode,
}: TenantBasicInfoTabProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target

    if (name === 'name') {
      const hasInvalidChars = /[^a-zA-Z0-9\s-]/.test(value)
      const sanitizedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase()

      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))

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

    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'email') {
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
      setImagePreview(null)
      setFormData((prev) => ({ ...prev, image: '' }))
      return
    }

    const isValidUrl = /^(https?:\/\/.+\..+|data:image\/.+;base64,.+)/.test(url)

    if (isValidUrl) {
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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
    },
    [setFormData, setImagePreview],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
  })

  return (
    <>
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
              <span className="text-red-400 text-sm mt-1">{errors.name}</span>
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
              <span className="text-red-400 text-sm mt-1">{errors.email}</span>
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
            <label className="text-sm font-medium text-body mb-1">Image</label>
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
    </>
  )
}

export default TenantBasicInfoTab
