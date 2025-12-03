import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchProjects,
  fetchProjectById,
  fetchCreateProject,
  fetchUpdateProject,
  fetchDeleteProject,
} from '@/api/projects'
import type { Project, ProjectList } from '@/types/projects'

export const useGetProjects = (
  page: number = 1,
  size: number = 10,
  search?: string,
) => {
  const { token } = useAuth()

  return useQuery<ProjectList, Error>({
    queryKey: ['projects', page, size, search],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchProjects(token, page, size, search)
    },
    retry: false,
    enabled: !!token,
  })
}

export const useGetAllProjects = () => {
  const { token } = useAuth()

  return useInfiniteQuery<ProjectList, Error>({
    queryKey: ['all-projects'],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchProjects(token, pageParam as number)
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number_of_page
      const totalPages = lastPage.total_pages
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    retry: false,
    enabled: !!token,
    refetchOnMount: 'always',
  })
}

export const useGetProjectById = (id: string) => {
  const { token } = useAuth()

  return useQuery<Project, Error>({
    queryKey: ['project', id],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchProjectById(id, token)
    },
    retry: false,
    enabled: !!token && !!id,
  })
}

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<Project, Error, Project>({
    mutationFn: (data) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchCreateProject(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error('Project create error:', error)
    },
  })
}

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    Project,
    Error,
    {
      id: string
      data: Project
    }
  >({
    mutationFn: ({ id, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUpdateProject(id, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error('Project update error:', error)
    },
  })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchDeleteProject(id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error('Project delete error:', error)
    },
  })
}
