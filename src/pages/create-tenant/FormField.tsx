interface FormFieldProps {
  label: string
  type?: string
  name?: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  error?: string
  required?: boolean
}

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
}: FormFieldProps) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-body mb-1">
      {label}
      {required && <span className="required"> *</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="text-red-400 text-sm mt-1">{error}</span>}
  </div>
)

export default FormField
