import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchPage, fetchPages, fetchSavePage } from '@/api/pages'
import type { Page } from '@/types/pages'


export const useSavePageMutation = () => {
  const { token } = useAuth() // Get token from your auth context

  return useMutation<Page, Error, Page>({
    mutationFn: (data: Page) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchSavePage(data, token);
    },
    onSuccess: (data) => {
      console.log('Page save success:', data)
    },
    onError: (error) => {
      console.error('Page save error:', error)
    },
  })
}

export const useGetAllPagesQuery = () => {
  const { token } = useAuth()

  return useQuery<Page[], Error>({
    queryKey: ['all-pages'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchPages(token)
    },
    enabled: !!token,
    
  })
}

export const useGetPageQuery = (id: string) => {
  const { token } = useAuth()

  return useQuery<Page, Error>({
    queryKey: ['page', id],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!id) {
        throw new Error('Page ID is required')
      }
      return fetchPage(id, token)
    },
    enabled: !!token && !!id,
  })
}