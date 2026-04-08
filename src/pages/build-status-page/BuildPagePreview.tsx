import Button from '@/components/Button'
import EditLabel from '@/pages/build-status-page/EditLabel'
import StatusGroup from './StatusGroup'
import { getStatusClass } from '@/utils/status'
import type { StatusGroupType, StatusItemType } from '@/types/common'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

interface BuildPagePreviewProps {
  color: string
  logo: string
  title: string
  desc: string
  statusGroups: StatusGroupType[]
  groupName: string
  columns: string
  selectIcon: string
  selectText: string
  report: string
  themeOption: 'theme_1' | 'theme_2'
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
}: BuildPagePreviewProps) => (
  <div className="border border-line rounded-lg p-4 shadow-md w-full max-w-3xl self-start">
    <header style={{ backgroundColor: color }} className="p-3 mb-2 rounded-lg">
      <div className="flex flex-col items-center">
        {logo && themeOption === 'theme_1' && (
          <img
            src={
              logo?.startsWith('http') || logo?.startsWith('data:')
                ? logo
                : `${BACKEND_API}${logo}`
            }
            className="my-2 h-20 w-auto object-contain"
            alt="Logo"
          />
        )}
        <div className="flex flex-row items-center gap-1 mb-1">
          <EditLabel
            label={title}
            onChange={onTitleChange}
            size="text-3xl"
            placeholder="Add a title"
          />
          <span className="required h-8">*</span>
        </div>
        <EditLabel
          label={desc}
          onChange={onDescChange}
          size="text-base"
          textArea={true}
          placeholder="Add a description"
          color="#6a7282"
        />
      </div>
    </header>
    <div>
      {statusGroups.map((col, index) => (
        <StatusGroup
          key={col.name}
          name={col.name}
          alias={col.alias || ''}
          items={col.list}
          group={groupName}
          columns={columns}
          getStatusClass={getStatusClass}
          onItemsChange={(next) => onUpdateGroup(index, next)}
          onRename={(nextName) => onRenameGroup(index, nextName)}
          onRemove={() => onRemoveGroup(index)}
          onChangeAlias={onChangeItemAlias}
          iconMode={selectIcon}
          textMode={selectText}
        />
      ))}
    </div>
    <div className="text-center mt-6">
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
  </div>
)

export default BuildPagePreview
