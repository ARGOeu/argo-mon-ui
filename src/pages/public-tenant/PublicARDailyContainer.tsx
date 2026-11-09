import { useEffect, useMemo } from 'react'
import { useGetGroupAR } from '@/hooks/useAvailabilityReliability'
import { useTenantName } from '@/hooks/useTenantName'
import { useOutletContext, useParams } from 'react-router-dom'
import ARDailyContent from '@/pages/availability-reliability/ARDailyContent'
import { getMonthRange } from '@/pages/availability-reliability/utils/dateRanges'
import { toGroupDailyRows } from '@/pages/availability-reliability/utils/dailyRows'
import { isPlatformDomain } from '@/utils/domains'
import type { PublicTenantOutletContext } from './PublicTenantLayout'

const PublicARDailyContainer = () => {
  const { tenantName } = useTenantName()
  const { groupName, reportName, month } = useParams<{
    groupName: string
    reportName: string
    month: string
  }>()
  const { setLastSelectedReport } =
    useOutletContext<PublicTenantOutletContext>()

  useEffect(() => {
    if (reportName) {
      setLastSelectedReport(reportName)
    }
  }, [reportName, setLastSelectedReport])

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetGroupAR(
    tenantName ?? '',
    reportName || '',
    groupName || '',
    'daily',
    startTime,
    endTime,
    'public',
    !!month,
  )

  const backTo = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups/report/${encodeURIComponent(reportName || '')}`
    : `/ar-groups/report/${encodeURIComponent(reportName || '')}`

  const rows = useMemo(() => toGroupDailyRows(rawData), [rawData])

  return (
    <ARDailyContent
      entityLabel="Group"
      name={groupName || ''}
      month={month || ''}
      rows={rows}
      isLoading={isLoading}
      error={error}
      backTo={backTo}
    />
  )
}

export default PublicARDailyContainer
