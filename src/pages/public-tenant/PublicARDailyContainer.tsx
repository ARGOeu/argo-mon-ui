import { useMemo } from 'react'
import { useGetPublicGroupAR } from '@/hooks/useAvailabilityReliability'
import { useTenantName } from '@/hooks/useTenantName'
import { useParams } from 'react-router-dom'
import ARDailyContent from '@/pages/availability-reliability/ARDailyContent'
import { getMonthRange } from '@/pages/availability-reliability/utils/dateRanges'
import { isPlatformDomain } from '@/utils/domains'

const PublicARDailyContainer = () => {
  const { tenantName } = useTenantName()
  const { groupName, reportName, month } = useParams<{
    groupName: string
    reportName: string
    month: string
  }>()

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetPublicGroupAR(
    tenantName ?? '',
    reportName || '',
    groupName || '',
    'daily',
    startTime,
    endTime,
    !!month,
  )

  const backTo = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups/report/${encodeURIComponent(reportName || '')}`
    : `/ar-groups/report/${encodeURIComponent(reportName || '')}`

  return (
    <ARDailyContent
      groupName={groupName || ''}
      month={month || ''}
      rawData={rawData}
      isLoading={isLoading}
      error={error}
      backTo={backTo}
    />
  )
}

export default PublicARDailyContainer
