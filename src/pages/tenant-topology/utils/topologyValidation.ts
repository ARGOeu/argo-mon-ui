const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContactValue = {
  value: string
}

export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email)
}

export const getValidContactEmails = (contacts: ContactValue[]): string[] => {
  return contacts
    .filter((contact) => contact.value.trim() && isValidEmail(contact.value))
    .map((contact) => contact.value)
}

export const getContactValidationErrors = (
  contacts: ContactValue[],
  requireAtLeastOneValid: boolean = false,
): string[] => {
  const errors: string[] = contacts.map((contact) => {
    if (!contact.value.trim()) {
      return ''
    }

    return isValidEmail(contact.value) ? '' : 'Invalid email'
  })

  if (requireAtLeastOneValid) {
    const hasValidContact = contacts.some(
      (contact) => contact.value.trim() && isValidEmail(contact.value),
    )

    if (!hasValidContact && errors.length > 0) {
      errors[0] = 'At least one valid email is required'
    }
  }

  return errors
}
