import { useState } from 'react'

type EditLabelProps = {
  label: string
  size?: string
  onChange: (newLabel: string) => void
  textArea?: boolean
  placeholder?: string
  color?: string
}

const EditLabel = (props: EditLabelProps) => {
  const [editMode, setEditMode] = useState(false)
  const [tempLabel, setTempLabel] = useState('')

  const handleEdit = () => {
    if (props.label) {
      setTempLabel(props.label)
    } else {
      setTempLabel(props.label)
    }

    setEditMode(true)
  }

  const handleSave = () => {
    props.onChange(tempLabel)
    setEditMode(false)
  }

  const handleCancel = () => {
    setTempLabel('')
    setEditMode(false)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="flex items-center">
      {editMode ? (
        <>
          {props.textArea ? (
            <textarea
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-80 font-semibold bg-surface-muted border border-line-strong rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              autoFocus
              onBlur={handleSave}
            />
          ) : (
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 font-semibold bg-surface-muted border border-line-strong rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              autoFocus
              onBlur={handleSave}
            />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-row items-center">
            <div className="tooltip tooltip-right" data-tip="edit">
              <span
                className={` ${props.size ? props.size : ''} font-medium text-gray-800 cursor-pointer border-b border-transparent hover:border-black hover:border-dashed`}
                onClick={handleEdit}
                style={{ color: props.color ? props.color : 'inherit' }}
              >
                {props.label || props.placeholder || ''}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EditLabel
