import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { PublicTenantOutletContext } from '../PublicTenantLayout'
import type { PublicReportItem } from '@/types/tenants'

export const useSelectedPublicReport = (
  reports: PublicReportItem[] | undefined,
  urlReportValue: string | null,
  setUrlReportValue: (report: string) => void,
): string => {
  const { lastSelectedReport, setLastSelectedReport } =
    useOutletContext<PublicTenantOutletContext>()

  const fallbackReport =
    lastSelectedReport && reports?.some((r) => r.name === lastSelectedReport)
      ? lastSelectedReport
      : (reports?.[0]?.name ?? '')

  const selectedReport =
    urlReportValue && reports?.some((r) => r.name === urlReportValue)
      ? urlReportValue
      : fallbackReport

  useEffect(() => {
    if (!reports || reports.length === 0) {
      return
    }
    if (urlReportValue !== selectedReport) {
      setUrlReportValue(selectedReport)
    }
  }, [reports, urlReportValue, selectedReport, setUrlReportValue])

  useEffect(() => {
    if (selectedReport) {
      setLastSelectedReport(selectedReport)
    }
  }, [selectedReport, setLastSelectedReport])

  return selectedReport
}
