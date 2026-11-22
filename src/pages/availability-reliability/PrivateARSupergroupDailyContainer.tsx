import { useMemo } from 'react'
import { useGetSupergroupAR } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import ARDailyContent from './ARDailyContent'
import { supergroupsTabSearch } from './ARContent'
import { getMonthRange } from './utils/dateRanges'
import { toSupergroupDailyRows } from './utils/dailyRows'
import { useGetUserTenantById } from '@/hooks/useTenants'

const PrivateARSupergroupDailyContainer = () => {
  const { id, supergroupName, reportName, month } = useParams<{
    id: string
    supergroupName: string
    reportName: string
    month: string
  }>()
  const tenantId = id || ''

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const { data: tenantData } = useGetUserTenantById(tenantId)

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetSupergroupAR(
    tenantId,
    reportName || '',
    supergroupName || '',
    'daily',
    startTime,
    endTime,
    'private',
    !!month,
  )

  const rows = useMemo(() => toSupergroupDailyRows(rawData), [rawData])

  return (
    <ARDailyContent
      entityLabel="Supergroup"
      tenantName={tenantData?.info.name ?? ''}
      tenantLogoUrl={tenantData?.info.image || undefined}
      reportName={reportName || ''}
      name={supergroupName || ''}
      month={month || ''}
      rows={rows}
      isLoading={isLoading}
      error={error}
      backTo={`/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}${supergroupsTabSearch}`}
    />
  )
}

export default PrivateARSupergroupDailyContainer
