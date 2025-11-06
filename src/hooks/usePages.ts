import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchPage,
  fetchPages,
  fetchSavePage,
  fetchUpdatePage,
} from '@/api/pages'
import type { Page, PageContent } from '@/types/pages'

export const useSavePageMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  return useMutation<PageContent, Error, PageContent>({
    mutationFn: (data: PageContent) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchSavePage(data, token)
    },
    onSuccess: (data) => {
      console.log('Page save success:', data)
      queryClient.invalidateQueries({ queryKey: ['all-pages'] })
    },
    onError: (error) => {
      console.error('Page save error:', error)
    },
  })
}

export const useUpdatePageMutation = (id: string) => {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  return useMutation<PageContent, Error, PageContent>({
    mutationFn: (data: PageContent) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUpdatePage(id, data, token)
    },
    onSuccess: (data) => {
      console.log('Page update success:', data)
      queryClient.invalidateQueries({ queryKey: ['all-pages'] })
      queryClient.invalidateQueries({ queryKey: ['page', id] })
    },
    onError: (error) => {
      console.error('Page update error:', error)
    },
  })
}

export const useGetAllPagesQuery = () => {
  const { token } = useAuth()

  return useQuery<Page, Error>({
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

  return useQuery<PageContent, Error>({
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
