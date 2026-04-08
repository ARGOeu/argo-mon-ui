import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchSecuredEndpoints,
  addEndpointRules,
  fetchAuthorizationRules,
} from '@/api/securedEndpoints'
import type {
  SecuredEndpointsPage,
  AddRulesRequest,
  AddRulesResponse,
  AuthorizationRules,
} from '@/types/securedEndpoints'

export const useGetSecuredEndpoints = (
  size: number = 100,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useInfiniteQuery<SecuredEndpointsPage, Error>({
    queryKey: ['secured-endpoints', size],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) throw new Error('No authentication token available')
      return fetchSecuredEndpoints(pageParam as number, size, token)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.number_of_page < lastPage.total_pages) {
        return lastPage.number_of_page + 1
      }
      return undefined
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetAuthorizationRules = (
  endpointId: string | null | undefined,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<AuthorizationRules[], Error>({
    queryKey: ['authorization-rules', endpointId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!endpointId) throw new Error('Endpoint ID is required')
      return fetchAuthorizationRules(endpointId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!endpointId,
  })
}

export const useAddEndpointRulesMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    AddRulesResponse,
    Error,
    { endpointId: string; body: AddRulesRequest }
  >({
    mutationFn: ({ endpointId, body }) => {
      if (!token) throw new Error('No authentication token available')
      return addEndpointRules(endpointId, body, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorization-rules'] })
    },
    onError: (error) => {
      console.error('Add endpoint rules error:', error)
    },
  })
}
