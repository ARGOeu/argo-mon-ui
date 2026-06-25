import { useCallback } from 'react'
import { useGetRoles } from '@/hooks/useSecuredEndpoints'

export const useRoleFriendlyName = () => {
  const { data: rolesData } = useGetRoles(1, 100)

  return useCallback(
    (role: string): string =>
      rolesData?.content.find((r) => r.name === role)?.attributes
        ?.preferred_name?.[0] ?? role,
    [rolesData],
  )
}
