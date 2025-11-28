import type { Project, ProjectList } from '@/types/projects'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchProjects = async (
  token: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<ProjectList> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/admin/projects?page=${page}&size=${size}${searchParam}`,
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

export const fetchProjectById = async (
  id: string,
  token: string,
): Promise<Project> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/projects/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchCreateProject = async (
  data: Project,
  token: string,
): Promise<Project> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchUpdateProject = async (
  id: string,
  data: Project,
  token: string,
): Promise<Project> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchDeleteProject = async (
  id: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }
}
