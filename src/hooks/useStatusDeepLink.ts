import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { StatusPath } from '@/types/statusTimeline'

export type DeepLinkTarget = {
  report?: string
  group?: string
  serviceType?: string
  endpoint?: string
  metric?: string
  ts?: string
}

export type DeepLinkFocus = {
  group?: string
  serviceType?: string
  endpoint?: string
  metric: string
  timestamp: string
}

export type DeepLinkPhase = 'resolving-report' | 'resolving-focus' | 'settled'

interface QueryLike {
  isPending: boolean
  data?: Array<{ name: string }>
}

const parseDeepLink = (searchParams: URLSearchParams): DeepLinkTarget => ({
  report: searchParams.get('report') || undefined,
  group: searchParams.get('group') || undefined,
  serviceType: searchParams.get('serviceType') || undefined,
  endpoint: searchParams.get('endpoint') || undefined,
  metric: searchParams.get('metric') || undefined,
  ts: searchParams.get('ts') || undefined,
})

export function useStatusDeepLink() {
  const [searchParams] = useSearchParams()
  const targetRef = useRef<DeepLinkTarget | null>(null)

  if (targetRef.current === null) {
    targetRef.current = parseDeepLink(searchParams)
  }

  const target = targetRef.current

  const hasDeepLink = Boolean(
    target.report ||
      target.group ||
      target.serviceType ||
      target.endpoint ||
      target.metric ||
      target.ts,
  )

  const focusTarget = useMemo<DeepLinkFocus | null>(() => {
    if (!target.metric || !target.ts) return null

    return {
      group: target.group,
      serviceType: target.serviceType,
      endpoint: target.endpoint,
      metric: target.metric,
      timestamp: target.ts,
    }
  }, [target])

  const [deepLinkPhase, setDeepLinkPhase] = useState<DeepLinkPhase>(
    hasDeepLink ? 'resolving-report' : 'settled',
  )

  const resolveReport = useCallback(
    (availableReports: Array<{ name: string }>) => {
      const firstReport = availableReports[0]?.name
      if (!firstReport) return null

      const firstResolution = deepLinkPhase === 'resolving-report'
      const report =
        firstResolution &&
        target.report &&
        availableReports.some((item) => item.name === target.report)
          ? target.report
          : firstReport

      const path: StatusPath =
        firstResolution && target.group
          ? {
              group: target.group,
              serviceType: target.serviceType,
              endpoint: target.endpoint,
            }
          : {}

      if (firstResolution) {
        setDeepLinkPhase(focusTarget ? 'resolving-focus' : 'settled')
      }

      return { report, path }
    },
    [deepLinkPhase, focusTarget, target],
  )

  const getFocusReady = useCallback(
    (input: {
      ready: boolean
      path: StatusPath
      groups: QueryLike
      serviceTypes: QueryLike
      endpoints: QueryLike
      metrics: QueryLike
    }) => {
      if (!focusTarget) return true
      if (deepLinkPhase === 'settled') return true
      if (deepLinkPhase !== 'resolving-focus') return false
      if (!input.ready) return false

      if (input.groups.isPending) return false
      if (!input.path.group) return true
      if (!input.groups.data?.some((g) => g.name === input.path.group)) {
        return true
      }

      if (!input.path.serviceType) return true
      if (input.serviceTypes.isPending) return false
      if (
        !input.serviceTypes.data?.some(
          (serviceType) => serviceType.name === input.path.serviceType,
        )
      ) {
        return true
      }

      if (!input.path.endpoint) return true
      if (input.endpoints.isPending) return false
      if (
        !input.endpoints.data?.some(
          (endpoint) => endpoint.name === input.path.endpoint,
        )
      ) {
        return true
      }

      if (input.metrics.isPending) return false
      return true
    },
    [deepLinkPhase, focusTarget],
  )

  const markFocusSettled = useCallback(() => {
    setDeepLinkPhase('settled')
  }, [])

  return {
    target,
    focusTarget,
    deepLinkPhase,
    settled: deepLinkPhase === 'settled',
    resolveReport,
    getFocusReady,
    markFocusSettled,
  }
}
