import { useMemo } from 'react'
import { useGetGroupAR } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import ARDailyContent from './ARDailyContent'
import { getMonthRange } from './utils/dateRanges'
import { toGroupDailyRows } from './utils/dailyRows'
import { useGetUserTenantById } from '@/hooks/useTenants'

const PrivateARDailyContainer = () => {
  const { id, groupName, reportName, month } = useParams<{
    id: string
    groupName: string
    reportName: string
    month: string
  }>()
  const tenantId = id || ''

  const { data: tenantData, isLoading: isTenantDataLoading } =
    useGetUserTenantById(tenantId)

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetGroupAR(
    tenantId,
    reportName || '',
    groupName || '',
    'daily',
    startTime,
    endTime,
    'private',
    !!month,
  )

  const rows = useMemo(() => toGroupDailyRows(rawData), [rawData])

  return (
    <ARDailyContent
      entityLabel="Group"
      tenantName={tenantData?.info.name ?? ''}
      tenantLogoUrl={tenantData?.info.image || undefined}
      reportName={reportName || ''}
      name={groupName || ''}
      month={month || ''}
      rows={rows}
      isLoading={isLoading || isTenantDataLoading}
      error={error}
      backTo={`/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}`}
    />
  )
}

export default PrivateARDailyContainer
