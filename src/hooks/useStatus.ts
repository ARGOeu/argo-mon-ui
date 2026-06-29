import { useQuery } from '@tanstack/react-query'
import type { PageConfig } from '@/types/pages'
import { fetchStatus } from '@/api/status'

export const useGetStatusQuery = (slug: string) => {
  return useQuery<PageConfig, Error>({
    queryKey: ['status', slug],
    queryFn: () => {
      if (!slug) {
        throw new Error('Page slug is required')
      }
      return fetchStatus(slug)
    },
    retry: false,
    enabled: !!slug,
  })
}
