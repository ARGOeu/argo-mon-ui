import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchDeletePage,
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
  const { token } = useAuth()
  return useMutation<PageContent, Error, PageContent>({
    mutationFn: (data: PageContent) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUpdatePage(id, data, token)
    },
    onError: (error) => {
      console.error('Page update error:', error)
    },
  })
}

export const useGetAllPagesQuery = (page: number = 1, size: number = 10) => {
  const { token } = useAuth()

  return useQuery<Page, Error>({
    queryKey: ['all-pages', page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchPages(token, page, size)
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

export const useDeletePageMutation = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<string, Error, string>({
    mutationFn: (id: string) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!id) {
        throw new Error('Page ID is required')
      }
      return fetchDeletePage(id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pages'] })
    },
    onError: (error) => {
      console.error('Page delete error:', error)
    },
  })
}
