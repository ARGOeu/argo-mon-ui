import Button from '@/components/Button'
import StatusLegend from '@/components/StatusLegend'
import { resolveLogoSrc } from '@/pages/build-status-page/utils/logoUtils'
import BuildExpandableGroup from '@/pages/build-status-page/BuildExpandableGroup'
import BuildStatus from '@/pages/build-status-page/BuildStatus'
import EditLabel from '@/pages/build-status-page/EditLabel'
import type { StatusGroupType, StatusItemType } from '@/types/common'
import type { ThemeOption } from '@/types/pages'

interface BuildPagePreviewProps {
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
  themeOption: ThemeOption
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

const BuildPagePreview = ({
  color,
  logo,
  hasLogo,
  title,
  desc,
  statusGroups,
  groupName,
  columns,
  selectIcon,
  selectText,
  report,
  themeOption,
  groupsMutationIsPending,
  onTitleChange,
  onDescChange,
  onUpdateGroup,
  onRenameGroup,
  onRemoveGroup,
  onChangeItemAlias,
  onAddStatusGroup,
}: BuildPagePreviewProps) => {
  if (themeOption === 'theme_2') {
    return (
      <div className="w-full max-w-3xl self-start">
        <BuildStatus
          color={color}
          logo={logo}
          hasLogo={hasLogo}
          title={title}
          desc={desc}
          statusGroups={statusGroups}
          groupName={groupName}
          columns={columns}
          selectIcon={selectIcon}
          selectText={selectText}
          report={report}
          groupsMutationIsPending={groupsMutationIsPending}
          onTitleChange={onTitleChange}
          onDescChange={onDescChange}
          onUpdateGroup={onUpdateGroup}
          onRenameGroup={onRenameGroup}
          onRemoveGroup={onRemoveGroup}
          onChangeItemAlias={onChangeItemAlias}
          onAddStatusGroup={onAddStatusGroup}
        />
      </div>
    )
  }

  const addGroupButton = (
    <div className="text-center mt-4">
      <div
        className={!report ? 'tooltip' : ''}
        data-tip={!report ? 'Please select a report first to add groups' : ''}
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
  )

  return (
    <div className="border border-line rounded-lg shadow-md w-full max-w-3xl self-start">
      {/* Theme 1 header */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b border-line rounded-t-lg"
        style={{ backgroundColor: color }}
      >
        {hasLogo && logo && (
          <img
            alt="Logo"
            className="h-12 object-contain shrink-0"
            src={resolveLogoSrc(logo)}
          />
        )}
        <div>
          <div className="flex flex-row items-center gap-1">
            <EditLabel
              label={title}
              onChange={onTitleChange}
              size="text-xl"
              placeholder="Add a title"
            />
            <span className="required h-6">*</span>
          </div>
          <EditLabel
            label={desc}
            onChange={onDescChange}
            size="text-sm"
            textArea={true}
            placeholder="Add a description"
            color="#6a7282"
          />
        </div>
      </header>

      {/* Theme 1 layout */}
      <main className="p-4">
        <div className="mb-4">
          <StatusLegend iconMode={selectIcon} />
        </div>

        {statusGroups.length > 0 && (
          <div className="space-y-4">
            {statusGroups.map((col, index) => (
              <BuildExpandableGroup
                key={col.name}
                name={col.name}
                alias={col.alias || ''}
                items={col.list}
                iconMode={selectIcon}
                textMode={selectText}
                columns={columns}
                group={groupName}
                onRename={(nextName) => onRenameGroup(index, nextName)}
                onRemove={() => onRemoveGroup(index)}
                onItemsChange={(next) => onUpdateGroup(index, next)}
                onChangeAlias={(itemName, newAlias) =>
                  onChangeItemAlias(col.name, itemName, newAlias)
                }
              />
            ))}
          </div>
        )}

        {addGroupButton}
      </main>
    </div>
  )
}

export default BuildPagePreview
