import { useState } from 'react'

type StatusLabelProps = {
  group: string
  label: string
  alias: string
  onChangeAlias: (newAlias: string) => void
  isGroupLabel?: boolean
  readOnly?: boolean
}

const StatusLabel = (props: StatusLabelProps) => {
  const [editMode, setEditMode] = useState(false)
  const [tempLabel, setTempLabel] = useState('')

  const handleEdit = () => {
    if (props.alias) {
      setTempLabel(props.alias)
    } else {
      setTempLabel(props.label)
    }

    setEditMode(true)
  }

  const handleSave = () => {
    props.onChangeAlias(tempLabel)
    setEditMode(false)
  }

  const handleCancel = () => {
    setTempLabel('')
    setEditMode(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="flex items-center gap-3">
      {editMode && !props.readOnly ? (
        <>
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center w-full"
            autoFocus
            onBlur={handleSave}
          />
        </>
      ) : (
        <>
          <div className="flex flex-row items-center min-w-0">
            {props.group ? (
              <div
                className={props.readOnly ? '' : 'tooltip tooltip-right'}
                data-tip={props.readOnly ? '' : 'edit'}
              >
                <span
                  className={`${props.isGroupLabel ? 'font-bold text-xl' : 'font-medium text-sm'} ${props.readOnly ? 'text-gray-700' : 'text-gray-600'} ${!props.readOnly ? 'cursor-pointer border-b border-transparent hover:border-black hover:border-dashed' : ''} tracking-wide break-words`}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  onClick={props.readOnly ? undefined : handleEdit}
                >
                  {props.alias ? props.alias : props.label}
                </span>
              </div>
            ) : (
              <span
                className="font-medium text-gray-600 border-b border-transparent text-sm tracking-wide break-words"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {props.label}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default StatusLabel
