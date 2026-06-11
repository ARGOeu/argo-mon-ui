import Button from '@/components/Button'
import StatusLegend from '@/components/StatusLegend'
import { resolveLogoSrc } from '@/pages/build-status-page/utils/logoUtils'
import EditLabel from '@/pages/build-status-page/EditLabel'
import StatusGroup from '@/pages/build-status-page/StatusGroup'
import { getStatusClass } from '@/utils/status'
import type { StatusGroupType, StatusItemType } from '@/types/common'

interface BuildStatusProps {
  color: string
  logo: string
  hasLogo: boolean
  title: string
  desc: string
  statusGroups: StatusGroupType[]
  groupName: string
  columns: string
  selectIcon: string
  selectText: string
  report: string
  groupsMutationIsPending: boolean
  onTitleChange: (value: string) => void
  onDescChange: (value: string) => void
  onUpdateGroup: (index: number, items: StatusItemType[]) => void
  onRenameGroup: (index: number, alias: string) => void
  onRemoveGroup: (index: number) => void
  onChangeItemAlias: (
    groupName: string,
    itemName: string,
    newAlias: string,
  ) => void
  onAddStatusGroup: () => void
}

const BuildStatus = ({
  color,
  logo,
  title,
  desc,
  statusGroups,
  groupName,
  columns,
  selectIcon,
  selectText,
  report,
  hasLogo,
  groupsMutationIsPending,
  onTitleChange,
  onDescChange,
  onUpdateGroup,
  onRenameGroup,
  onRemoveGroup,
  onChangeItemAlias,
  onAddStatusGroup,
}: BuildStatusProps) => {
  const resolvedLogo = logo && hasLogo ? resolveLogoSrc(logo) : undefined

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <header className="relative">
        <div className="relative h-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/public-status-page-placeholder.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        {resolvedLogo && (
          <div className="relative flex justify-center -mt-20">
            <div className="bg-white rounded-full p-2 shadow-xl">
              <img
                alt="Logo"
                className="h-32 w-32 object-contain"
                src={resolvedLogo}
                style={{
                  borderRadius: '50%',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          </div>
        )}

        <div
          className={`text-center pt-2 pb-3 px-24 ${resolvedLogo ? 'mt-1' : 'mt-0'}`}
          style={{ backgroundColor: color }}
        >
          <div className="space-y-3">
            <div className="flex flex-row items-center justify-center gap-1 mb-1">
              <EditLabel
                label={title}
                onChange={onTitleChange}
                size="text-xl"
                placeholder="Add a title"
              />
              <span className="required h-8">*</span>
            </div>
            <div className="flex justify-center">
              <EditLabel
                label={desc}
                onChange={onDescChange}
                size="text-base"
                textArea={true}
                placeholder="Add a description"
                color="#6a7282"
              />
            </div>
          </div>
        </div>

        <div className="px-16 my-1 flex justify-center">
          <StatusLegend iconMode={selectIcon} />
        </div>
      </header>

      <main className="px-4">
        {statusGroups.map((col, index) => (
          <StatusGroup
            key={col.name}
            name={col.name}
            alias={col.alias || ''}
            items={col.list}
            columns={columns}
            iconMode={selectIcon}
            textMode={selectText}
            group={groupName}
            getStatusClass={getStatusClass}
            onRename={(nextName) => onRenameGroup(index, nextName)}
            onRemove={() => onRemoveGroup(index)}
            onItemsChange={(next) => onUpdateGroup(index, next)}
            onChangeAlias={onChangeItemAlias}
          />
        ))}
        <div className="text-center mt-4 mb-4">
          <div
            className={!report ? 'tooltip' : ''}
            data-tip={
              !report ? 'Please select a report first to add groups' : ''
            }
          >
            <Button
              disabled={!report || groupsMutationIsPending}
              onClick={onAddStatusGroup}
              variant="outline-secondary"
            >
              Click here to Add a new Group
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BuildStatus
