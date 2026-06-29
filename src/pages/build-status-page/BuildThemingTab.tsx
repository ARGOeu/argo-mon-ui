import { useCallback } from 'react'
import {
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
} from '@heroicons/react/16/solid'
import { BanIcon, Columns2Icon, LayoutListIcon, SquareIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import SelectGroup from './SelectGroup'
import type { ThemeOption } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const labelClass = 'block text-sm font-medium text-body mb-1'

interface BuildThemingTabProps {
  color: string
  hasLogo: boolean
  logoUrl: string
  logoPreview: string | null
  selectIcon: string
  selectText: string
  columns: string
  themeOption: ThemeOption
  onColorChange: (value: string) => void
  onHasLogoChange: (value: boolean) => void
  onLogoUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: (e: React.MouseEvent) => void
  onLogoFileChange: (base64: string) => void
  onIconChange: (value: string) => void
  onTextChange: (value: string) => void
  onColumnsChange: (value: string) => void
  onThemeOptionChange: (value: ThemeOption) => void
}

const BuildThemingTab = ({
  color,
  hasLogo,
  logoUrl,
  logoPreview,
  selectIcon,
  selectText,
  columns,
  themeOption,
  onColorChange,
  onHasLogoChange,
  onLogoUrlChange,
  onRemoveLogo,
  onLogoFileChange,
  onIconChange,
  onTextChange,
  onColumnsChange,
  onThemeOptionChange,
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
              <label className={labelClass}>Color:</label>
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
              <label className={labelClass}>Theme:</label>
              <SelectGroup
                selected={themeOption}
                className="grid grid-cols-2 gap-2"
                onChange={(val) => onThemeOptionChange(val as ThemeOption)}
              >
                <SelectGroup.Item value="theme_1">
                  <LayoutListIcon className="w-4 shrink-0" />
                  <div>Theme 1</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="theme_2">
                  <PhotoIcon className="w-4 shrink-0" />
                  <div>Theme 2</div>
                </SelectGroup.Item>
              </SelectGroup>
            </div>

            <div>
              <div className="flex items-center gap-3 mt-4 mb-1">
                <span className={labelClass}>
                  Logo:
                  {hasLogo && <span className="required ml-0.5">*</span>}
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-brand"
                    checked={hasLogo}
                    onChange={(e) => onHasLogoChange(e.target.checked)}
                  />
                  <span className="text-sm text-muted">
                    {hasLogo ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              {hasLogo && (
                <div className="space-y-2">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                      isDragActive
                        ? 'border-blue-400 bg-brand-subtle'
                        : 'border-line-strong bg-surface-muted hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {logoPreview ? (
                      <div className="relative flex flex-col items-center gap-1 w-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveLogo(e)
                          }}
                          className="absolute -top-1 -right-1 bg-gray-600 hover:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-md cursor-pointer"
                          aria-label="Remove logo"
                        >
                          <XMarkIcon className="w-4 h-4 text-white" />
                        </button>
                        <img
                          alt="Logo"
                          className="h-24 w-24 object-contain rounded"
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
                  <div className="flex items-center my-1">
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
              )}
            </div>

            <div>
              <label className={labelClass}>Status Icon:</label>
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
                <SelectGroup.Item value="none">
                  <BanIcon className="w-4" />
                  <div>None</div>
                </SelectGroup.Item>
              </SelectGroup>
            </div>

            <div>
              <label className={labelClass}>Status Text:</label>
              <SelectGroup selected={selectText} onChange={onTextChange}>
                <SelectGroup.Item value="text">
                  <div className="text-green-500">
                    <small>OK</small>
                  </div>
                  <div>Text</div>
                </SelectGroup.Item>
                <SelectGroup.Item value="badge">
                  <div className="badge badge-success text-white px-2 py-1">
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
              <label className={labelClass}>Status Columns:</label>
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
