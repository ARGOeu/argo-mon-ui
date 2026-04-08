import type {
  SecuredEndpointsPage,
  AddRulesRequest,
  AddRulesResponse,
  AuthorizationRules,
} from '@/types/securedEndpoints'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchSecuredEndpoints = async (
  page: number = 1,
  size: number = 10,
  token: string,
): Promise<SecuredEndpointsPage> => {
  const response = await fetch(
    `${BACKEND_API}/secured-endpoints?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchAuthorizationRules = async (
  endpointId: string,
  token: string,
): Promise<AuthorizationRules[]> => {
  const response = await fetch(
    `${BACKEND_API}/secured-endpoints/${endpointId}/rules`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const addEndpointRules = async (
  endpointId: string,
  body: AddRulesRequest,
  token: string,
): Promise<AddRulesResponse> => {
  const response = await fetch(
    `${BACKEND_API}/secured-endpoints/${endpointId}/rules`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
