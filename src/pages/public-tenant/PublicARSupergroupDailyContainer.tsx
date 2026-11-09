import { useEffect, useMemo } from 'react'
import { useGetSupergroupAR } from '@/hooks/useAvailabilityReliability'
import { useTenantName } from '@/hooks/useTenantName'
import { useOutletContext, useParams } from 'react-router-dom'
import ARDailyContent from '@/pages/availability-reliability/ARDailyContent'
import { supergroupsTabSearch } from '@/pages/availability-reliability/ARContent'
import { getMonthRange } from '@/pages/availability-reliability/utils/dateRanges'
import { toSupergroupDailyRows } from '@/pages/availability-reliability/utils/dailyRows'
import { isPlatformDomain } from '@/utils/domains'
import type { PublicTenantOutletContext } from './PublicTenantLayout'

const PublicARSupergroupDailyContainer = () => {
  const { tenantName } = useTenantName()
  const { supergroupName, reportName, month } = useParams<{
    supergroupName: string
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
  } = useGetSupergroupAR(
    tenantName ?? '',
    reportName || '',
    supergroupName || '',
    'daily',
    startTime,
    endTime,
    'public',
    !!month,
  )

  const rows = useMemo(() => toSupergroupDailyRows(rawData), [rawData])

  const backTo = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups/report/${encodeURIComponent(reportName || '')}${supergroupsTabSearch}`
    : `/ar-groups/report/${encodeURIComponent(reportName || '')}${supergroupsTabSearch}`

  return (
    <ARDailyContent
      entityLabel="Supergroup"
      name={supergroupName || ''}
      month={month || ''}
      rows={rows}
      isLoading={isLoading}
      error={error}
      backTo={backTo}
    />
  )
}

export default PublicARSupergroupDailyContainer
