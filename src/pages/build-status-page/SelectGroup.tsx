import { Children, type ReactElement, type ReactNode } from 'react'

interface SelectItemProps {
  children: ReactNode
  value: string
}

const SelectItem = ({ children, value }: SelectItemProps) => {
  return <div key={value}>{children}</div>
}

interface SelectGroupProps {
  children: ReactElement<SelectItemProps> | ReactElement<SelectItemProps>[]
  selected?: string
  onChange?: (value: string) => void
}

interface SelectItemData {
  value: string
  children: ReactNode
}

const SelectGroup = ({ children, selected, onChange }: SelectGroupProps) => {
  const items =
    Children.map(children, (child: ReactElement<SelectItemProps>) => {
      if (child?.type === SelectItem) {
        return {
          value: child.props.value,
          children: child.props.children,
        }
      }
      return null
    })?.filter((item): item is SelectItemData => item !== null) || []

  const handleClick = (value: string) => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {items.map((item: SelectItemData) => {
        const isSelected = selected === item.value

        return (
          <button
            key={item.value}
            onClick={() => handleClick(item.value)}
            className={`btn h-9 px-3 text-sm ${
              isSelected
                ? 'bg-brand-subtle border-brand text-brand hover:bg-brand-muted hover:border-brand font-medium'
                : 'bg-surface-muted border-line text-body hover:bg-surface-strong hover:border-line-strong font-normal'
            }`}
          >
            {item.children}
          </button>
        )
      })}
    </div>
  )
}

SelectGroup.Item = SelectItem

export default SelectGroup
