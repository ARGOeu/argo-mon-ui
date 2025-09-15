import { useQuery } from '@tanstack/react-query'
import type { Page } from '@/types/pages'
import { fetchStatus } from '@/api/status'


export const useGetStatusQuery = (slug: string) => {

  return useQuery<Page, Error>({
    queryKey: ['status', slug],
    queryFn: () => {
      if (!slug) {
        throw new Error('Page slug is required')
      }
      return fetchStatus(slug)
    },
    enabled: !!slug
  })
}