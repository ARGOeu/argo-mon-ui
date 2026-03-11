import { useState } from 'react'
import { useGetUserContactTypes } from '@/hooks/useTenants'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-2.5'
const iconButtonClass =
  'flex items-center justify-center size-7 rounded-md bg-blue-500 text-white border-none cursor-pointer hover:bg-blue-600'
const iconButtonDangerClass =
  'flex items-center justify-center size-7 rounded-md bg-red-500 text-white border-none cursor-pointer hover:bg-red-600'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactInformationProps {
  contacts: Array<{
    name: string
    email: string
    type: string
  }>
  onContactsChange: (
    contacts: Array<{
      name: string
      email: string
      type: string
    }>,
  ) => void
  onValidationChange?: (hasError: boolean) => void
  initialData?: Array<{ name: string; email: string; type?: string }> | null
}

const ContactInformation = ({
  contacts,
  onContactsChange,
  onValidationChange,
}: ContactInformationProps) => {
  const [errors, setErrors] = useState<Array<{ email: string }>>(() =>
    contacts.map(() => ({ email: '' })),
  )

  const { data: contactTypes, isLoading: isContactTypesLoading } =
    useGetUserContactTypes()

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    const updatedContacts = [...contacts]
    updatedContacts[index] = {
      ...updatedContacts[index],
      [name]: value,
    }
    onContactsChange(updatedContacts)

    if (name === 'email') {
      const updatedErrors = [...errors]
      if (value && !emailRegex.test(value)) {
        updatedErrors[index] = { email: 'Please enter a valid email address' }
        onValidationChange?.(true)
      } else {
        updatedErrors[index] = { email: '' }
        const hasAnyError = updatedErrors.some((err) => err.email)
        onValidationChange?.(hasAnyError)
      }
      setErrors(updatedErrors)
    }
  }

  const handleAddContact = () => {
    if (contacts.length < 5) {
      onContactsChange([...contacts, { name: '', email: '', type: '' }])
      setErrors([...errors, { email: '' }])
    }
  }

  const handleRemoveContact = (index: number) => {
    if (contacts.length > 1) {
      const updatedContacts = contacts.filter((_, i) => i !== index)
      const updatedErrors = errors.filter((_, i) => i !== index)
      onContactsChange(updatedContacts)
      setErrors(updatedErrors)
      const hasAnyError = updatedErrors.some((err) => err.email)
      onValidationChange?.(hasAnyError)
    }
  }

  return (
    <div className={sectionClass}>
      <div className="pt-2 pl-2">
        <h2 className="section-title">Contact Information</h2>
        <p className="section-description">Contact details for the tenant</p>
      </div>

      <div className={sectionContentClass}>
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 pb-4 mb-2 border-b border-line last:border-b-0 last:mb-0 last:pb-0"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-base font-semibold text-body">
                Contact {index + 1}
              </span>
              <div className="flex gap-2">
                {index === contacts.length - 1 && contacts.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className={iconButtonClass}
                    title="Add contact"
                  >
                    <PlusIcon className="size-5" />
                  </button>
                )}
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className={iconButtonDangerClass}
                    title="Remove contact"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={contact.name}
                onChange={(e) => handleChange(index, e)}
                placeholder="Enter contact name"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={contact.email}
                onChange={(e) => handleChange(index, e)}
                placeholder="Enter contact email"
              />
              {errors[index]?.email && (
                <span className="text-red-400 text-sm mt-1">
                  {errors[index].email}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Type <span className="required">*</span>
              </label>
              {isContactTypesLoading ? (
                <div className="text-sm text-muted">Loading...</div>
              ) : (
                <select
                  name="type"
                  value={contact.type}
                  onChange={(e) => handleChange(index, e)}
                  className="capitalize"
                >
                  <option value="">Select contact type</option>
                  {contactTypes?.map((type) => (
                    <option key={type} value={type} className="capitalize">
                      {type.toLowerCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContactInformation
