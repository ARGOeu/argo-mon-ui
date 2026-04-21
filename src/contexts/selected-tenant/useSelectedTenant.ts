import { useContext } from 'react'
import { SelectedTenantContext } from './SelectedTenantContext'
import type { SelectedTenantContextValue } from './SelectedTenantContext'

export const useSelectedTenant = (): SelectedTenantContextValue => {
  const context = useContext(SelectedTenantContext)
  if (!context)
    throw new Error(
      'useSelectedTenant must be used within SelectedTenantProvider',
    )
  return context
}
