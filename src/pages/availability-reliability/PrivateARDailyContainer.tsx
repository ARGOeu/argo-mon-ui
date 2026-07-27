import { useMemo } from 'react'
import { useGetGroupAR } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import ARDailyContent from './ARDailyContent'
import { getMonthRange } from './utils/dateRanges'

const PrivateARDailyContainer = () => {
  const { id, groupName, reportName, month } = useParams<{
    id: string
    groupName: string
    reportName: string
    month: string
  }>()
  const tenantId = id || ''

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

  return (
    <ARDailyContent
      groupName={groupName || ''}
      month={month || ''}
      rawData={rawData}
      isLoading={isLoading}
      error={error}
      backTo={`/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}`}
    />
  )
}

export default PrivateARDailyContainer
