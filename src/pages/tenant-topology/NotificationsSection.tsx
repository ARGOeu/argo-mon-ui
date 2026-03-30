import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import IconButton from '@/components/IconButton'

export interface Contact {
  id: string
  value: string
}

interface NotificationsSectionProps {
  subtitle?: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  contacts: Contact[]
  contactErrors: string[]
  onContactChange: (index: number, value: string) => void
  onAddContact: () => void
  onRemoveContact: (index: number) => void
}

const NotificationsSection = ({
  subtitle = 'endpoint',
  enabled,
  onEnabledChange,
  contacts,
  contactErrors,
  onContactChange,
  onAddContact,
  onRemoveContact,
}: NotificationsSectionProps) => {
  return (
    <>
      <div>
        <p className="section-title">Notifications</p>
        <p className="section-description">
          Enable email notifications for this {subtitle}
        </p>
      </div>
      <div className="bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-brand"
            checked={enabled}
            onChange={() => onEnabledChange(!enabled)}
          />
          <div>
            <p className="text-sm font-semibold text-body">
              {enabled ? 'Notifications enabled' : 'Notifications disabled'}
            </p>
          </div>
        </label>

        {enabled && (
          <div className="flex flex-col gap-2 mt-1 animate-fade-in">
            <p className="text-sm font-medium text-body">
              Contact Emails <span className="required">*</span>
            </p>
            {contacts.map((contact, index) => (
              <div key={contact.id} className="flex items-start gap-1">
                <div className="flex flex-col flex-1">
                  <input
                    type="email"
                    value={contact.value}
                    onChange={(e) => onContactChange(index, e.target.value)}
                    placeholder="Enter contact email"
                    className={
                      contactErrors[index]
                        ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                        : ''
                    }
                  />
                  {contactErrors[index] && (
                    <span className="text-xs text-red-500 mt-1">
                      {contactErrors[index]}
                    </span>
                  )}
                </div>
                {contacts.length > 1 && (
                  <div className="mt-1">
                    <IconButton
                      icon={<TrashIcon className="size-4.5" />}
                      label="Remove contact"
                      onClick={() => onRemoveContact(index)}
                      className="text-red-600 hover:bg-red-50"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={onAddContact}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Add another email
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationsSection
