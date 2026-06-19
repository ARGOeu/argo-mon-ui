import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const DOMAINS_URL = import.meta.env.VITE_DOMAINS_URL ?? '/domains.json'

interface TenantNameResult {
  tenantName: string | null
  loading: boolean
}

export function useTenantName(): TenantNameResult {
  const { tenantName: tenantFromParam } = useParams<{ tenantName?: string }>()
  const [resolved, setResolved] = useState<string | null>(null)
  const [loading, setLoading] = useState(!tenantFromParam)

  useEffect(() => {
    if (tenantFromParam) return // came straight from the URL, nothing to resolve

    fetch(DOMAINS_URL)
      .then((res) => res.json())
      .then((domains: Record<string, string>) => {
        setResolved(domains[window.location.hostname] ?? null)
      })
      .catch(() => setResolved(null))
      .finally(() => setLoading(false))
  }, [tenantFromParam])

  return {
    tenantName: tenantFromParam ?? resolved,
    loading: tenantFromParam ? false : loading,
  }
}
