import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import type { ReportListItem, Tenant } from '@/types/tenants'
import SelectDropdown from '@/components/SelectDropdown'

const labelClass = 'block text-sm font-medium text-body mb-1'

interface BuildConfigTabProps {
  name: string
  slug: string
  tenantId: string
  isEditMode: boolean
  isTenantSelectionDisabled: boolean
  tenantsData: Tenant[]
  reportsData: ReportListItem[] | undefined
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
  onTenantChange: (value: string) => void
}

const BuildConfigTab = ({
  name,
  slug,
  tenantId,
  isEditMode,
  isTenantSelectionDisabled,
  tenantsData,
  reportsData,
  onNameChange,
  onSlugChange,
  onTenantChange,
}: BuildConfigTabProps) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
      <div className="pt-2 ps-2">
        <h3 className="section-title">Page Settings</h3>
        <p className="section-description">
          Basic information for your status page.
        </p>
      </div>

      <div className="bg-white border border-line rounded-lg p-6 space-y-4">
        <div>
          <label className={labelClass}>
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="w-full"
            placeholder="Enter page name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>
            Path <span className="required">*</span>
          </label>
          <input
            type="text"
            className="w-full"
            placeholder="Enter page path"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
      <div className="pt-2 ps-2">
        <h3 className="section-title">Data Source</h3>
        <p className="section-description">
          Select a tenant to access its reports.
        </p>
      </div>

      <div className="bg-white border border-line rounded-lg p-6 space-y-2">
        <div>
          <label className={labelClass}>
            Tenant: <span className="required">*</span>
          </label>
          <SelectDropdown
            value={tenantId}
            onChange={onTenantChange}
            options={tenantsData
              .filter((tenant) => tenant.id)
              .map((tenant) => ({
                value: tenant.id as string,
                label: tenant.info.name,
              }))}
            placeholder="Select a tenant"
            disabled={isTenantSelectionDisabled}
          />
          {isTenantSelectionDisabled && (
            <p className="text-xs text-muted mt-1">
              {isEditMode
                ? 'Tenant cannot be changed when editing a status page'
                : 'You are currently creating a status page for this specific tenant'}
            </p>
          )}
        </div>

        {!isEditMode && tenantId && reportsData && reportsData.length > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center">
            <CheckBadgeIcon className="size-5 inline-block me-2" />
            {reportsData.length} report{reportsData.length !== 1 ? 's' : ''}{' '}
            available
          </div>
        )}

        {tenantId && reportsData && reportsData.length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            No reports found for this tenant
          </div>
        )}
      </div>
    </div>
  </div>
)

export default BuildConfigTab
