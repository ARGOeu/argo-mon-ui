import { useCallback } from 'react'
import {
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
} from '@heroicons/react/16/solid'
import { BanIcon, Columns2Icon, SquareIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import SelectGroup from './SelectGroup'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

interface BuildThemingTabProps {
  color: string
  logoUrl: string
  logoPreview: string | null
  selectIcon: string
  selectText: string
  columns: string
  onColorChange: (value: string) => void
  onLogoUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: (e: React.MouseEvent) => void
  onLogoFileChange: (base64: string) => void
  onIconChange: (value: string) => void
  onTextChange: (value: string) => void
  onColumnsChange: (value: string) => void
}

const BuildThemingTab = ({
  color,
  logoUrl,
  logoPreview,
  selectIcon,
  selectText,
  columns,
  onColorChange,
  onLogoUrlChange,
  onRemoveLogo,
  onLogoFileChange,
  onIconChange,
  onTextChange,
  onColumnsChange,
}: BuildThemingTabProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
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
          onLogoFileChange(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    },
    [onLogoFileChange],
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
    <div className="space-y-4">
      <div>
        <div className="border border-line rounded-lg px-5 py-4 space-y-3">
          <h3 className="section-title mb-0">Customize Appearance</h3>
          <p className="section-description mb-2">
            Customize colors, logo, and status display options.
          </p>
          <div className="bg-white rounded-lg py-2 space-y-3 mt-1">
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Color:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-14 h-10 rounded cursor-pointer border-2 border-line-strong p-1"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Logo:
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                  isDragActive
                    ? 'border-blue-400 bg-brand-subtle'
                    : 'border-line-strong bg-surface-muted hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                {logoPreview ? (
                  <div className="relative flex flex-col items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={onRemoveLogo}
                      className="absolute -top-2 -right-2 bg-gray-600 hover:bg-gray-700 border-2 border-white rounded-full w-7 h-7 flex items-center justify-center z-10 shadow-md"
                      aria-label="Remove logo"
                    >
                      <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                    <img
                      alt="Logo"
                      className="h-20 w-20 object-contain rounded"
                      src={
                        logoPreview?.startsWith('http') ||
                        logoPreview?.startsWith('data:')
                          ? logoPreview
                          : `${BACKEND_API}${logoPreview}`
                      }
                    />
                    <p className="text-sm text-muted">
                      Click or drag to change
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-subtle mb-1">
                      <PhotoIcon className="mx-auto h-10 w-10" />
                    </div>
                    <p className="text-sm text-muted">
                      {isDragActive
                        ? 'Drop logo here'
                        : 'Drop logo here or click to upload'}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center my-2">
                <div className="flex-1 border-b border-line-strong"></div>
                <span className="px-3 text-xs text-muted font-medium uppercase">
                  OR
                </span>
                <div className="flex-1 border-b border-line-strong"></div>
              </div>
              <input
                type="url"
                value={logoUrl}
                onChange={onLogoUrlChange}
                className="w-full"
                placeholder="Enter logo URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Status Icon:
              </label>
              <SelectGroup selected={selectIcon} onChange={onIconChange}>
                <SelectGroup.Item value="led">
                  <div
                    aria-label="status"
                    className="status status-lg status-success"
                  ></div>
                  <div>Led</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="icon">
                  <CheckCircleIcon className="text-green-500 size-4" />
                  <div>Icon</div>
                </SelectGroup.Item>
              </SelectGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Status Text:
              </label>
              <SelectGroup selected={selectText} onChange={onTextChange}>
                <SelectGroup.Item value="text">
                  <div className="text-green-500">
                    <small>OK</small>
                  </div>
                  <div>Text</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="badge">
                  <div className="badge badge-success text-white">
                    <small>OK</small>
                  </div>
                  <div>Badge</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="none">
                  <BanIcon className="w-4" />
                  <div>None</div>
                </SelectGroup.Item>
              </SelectGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Status Columns:
              </label>
              <SelectGroup selected={columns} onChange={onColumnsChange}>
                <SelectGroup.Item value="one">
                  <SquareIcon className="w-4" />
                  <div>One</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="two">
                  <Columns2Icon className="w-4" />
                  <div>Two</div>
                </SelectGroup.Item>
              </SelectGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildThemingTab
