import { useSearchParams } from 'react-router-dom'

export const useMetricParam = (): [string[], (metrics: string[]) => void] => {
  const [searchParams, setSearchParams] = useSearchParams()

  const setMetrics = (metrics: string[]) => {
    const next = new URLSearchParams(searchParams)
    next.delete('metric')
    metrics.forEach((metric) => next.append('metric', metric))
    setSearchParams(next, { replace: true })
  }

  return [searchParams.getAll('metric'), setMetrics]
}
