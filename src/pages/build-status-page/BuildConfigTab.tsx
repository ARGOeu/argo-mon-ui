import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import type { TenantList, ReportListItem } from '@/types/tenants'
import SelectDropdown from '@/components/SelectDropdown'

interface BuildConfigTabProps {
  name: string
  slug: string
  tenantId: string
  isEditMode: boolean
  tenantsData: TenantList | undefined
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
          <label className="block text-sm font-medium text-body mb-2">
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
          <label className="block text-sm font-medium text-body mb-2">
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

      <div className="bg-white border border-line rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Tenant: <span className="required">*</span>
          </label>
          <SelectDropdown
            value={tenantId}
            onChange={onTenantChange}
            options={
              tenantsData?.content
                .filter((tenant) => tenant.id)
                .map((tenant) => ({
                  value: tenant.id as string,
                  label: tenant.info.name,
                })) ?? []
            }
            placeholder="Select a tenant"
            disabled={isEditMode}
          />
          {isEditMode && (
            <p className="text-xs text-muted mt-1">
              Tenant cannot be changed when editing a page
            </p>
          )}
        </div>

        {!isEditMode && tenantId && reportsData && reportsData.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center">
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
