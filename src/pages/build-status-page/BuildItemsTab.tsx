import { useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectDropdown from '@/components/SelectDropdown'
import { StatusItem } from './StatusItem'
import type { StatusItemType, StatusGroupType } from '@/types/common'
import type { ReportListItem } from '@/types/tenants'

const labelClass = 'block text-sm font-medium text-body mb-1'

interface BuildItemsTabProps {
  tenantId: string
  report: string
  reportsData: ReportListItem[] | undefined
  reportsLoading: boolean
  groupsMutationIsPending: boolean
  groupsMutationData: StatusItemType[] | undefined
  parent: React.RefObject<HTMLUListElement | null>
  items: StatusItemType[]
  statusGroups: StatusGroupType[]
  selectIcon: string
  selectText: string
  onReportChange: (value: string) => void
}

const BuildItemsTab = ({
  tenantId,
  report,
  reportsData,
  reportsLoading,
  groupsMutationIsPending,
  groupsMutationData,
  parent,
  items,
  statusGroups,
  selectIcon,
  selectText,
  onReportChange,
}: BuildItemsTabProps) => {
  const [filterItems, setFilterItems] = useState('')

  const fl = filterItems.trim().toLowerCase()
  const groupsFiltered =
    fl !== ''
      ? items.filter((item) =>
          `${item.name} ${item.status}`.toLowerCase().includes(fl),
        )
      : items

  return (
    <div className="space-y-4">
      <div>
        <div className="border border-line rounded-lg px-5 py-4 space-y-3">
          <div>
            <h3 className="section-title mb-0">Report Selection</h3>
            <p className="section-description mb-2">
              Choose a report and manage items.
            </p>
          </div>

          {!tenantId && (
            <div className="text-sm text-muted p-4 text-center bg-surface-muted rounded mt-6">
              Select a tenant in the Config tab to load reports
            </div>
          )}

          {tenantId && reportsLoading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" inline />
              <span className="ml-2 text-sm text-muted">
                Loading reports...
              </span>
            </div>
          )}

          {tenantId && reportsData && reportsData.length > 0 && (
            <>
              <div>
                <label className={labelClass}>Report:</label>
                <SelectDropdown
                  value={report}
                  onChange={onReportChange}
                  options={reportsData.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  placeholder="Select a report"
                  disabled={statusGroups.length > 0}
                />
              </div>

              {groupsMutationIsPending && (
                <div className="p-2 text-base mt-2 mx-auto text-center">
                  <LoadingSpinner size="xs" inline />
                </div>
              )}

              {groupsMutationData &&
                (groupsMutationData.length === 0 ? (
                  <div className="text-sm required p-2 mt-2 bg-red-50 border-red-400 border text-center rounded">
                    Report is empty!
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className={labelClass}>Search Items:</label>
                      <input
                        type="text"
                        className="w-full"
                        placeholder="Search..."
                        name="filter"
                        value={filterItems}
                        onChange={(e) => setFilterItems(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-subtle rounded-lg p-1 mt-2 mb-1">
                      Drag and drop items to the preview panel to add them to a
                      group
                    </div>
                    <div className="max-h-[500px] overflow-y-auto border border-line rounded px-4 py-1">
                      <ul ref={parent}>
                        {(groupsFiltered ?? []).map((group) => (
                          <li key={group.name} className="my-2">
                            <StatusItem
                              iconMode={selectIcon}
                              textMode={selectText}
                              group=""
                              drag={true}
                              dragHandle="dnd-handle"
                              name={group.name}
                              alias={group.alias || ''}
                              status={group.status}
                              onChangeAlias={() => {}}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildItemsTab
