import { useEffect, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useGetTopologyFeedQuery } from '@/hooks/useTenants'

type DateMode = 'latest' | 'custom'

interface UseTopologyListStateOptions {
  latestDate: string
}

export const useTopologyListState = <TSort extends string>({
  latestDate,
}: UseTopologyListStateOptions) => {
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<TSort | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [dateMode, setDateMode] = useState<DateMode>('latest')
  const [dateInput, setDateInput] = useState('')
  const [committedDate, setCommittedDate] = useState('')

  useEffect(() => {
    setCurrentPage(1)
  }, [searchInput])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCommittedDate(dateInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [dateInput])

  useEffect(() => {
    setCurrentPage(1)
  }, [committedDate])

  const { tenant } = useSelectedTenant()
  const { data: topologyFeedData, isFetching: isTopologyFeedFetching } =
    useGetTopologyFeedQuery(tenant?.id ?? '', !!tenant?.id)
  const isInternal = topologyFeedData?.type === 'internal'
  const isExternal = topologyFeedData?.type === 'external'
  const isTopologyTypeLoading = !tenant?.id || isTopologyFeedFetching

  const showActions =
    isInternal &&
    (dateMode === 'latest' ||
      (dateMode === 'custom' && committedDate === latestDate && !!latestDate))

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value)
  }

  const handleDateModeChange = (mode: string) => {
    setDateMode(mode as DateMode)
    if (mode === 'custom') {
      setDateInput(latestDate)
      setCommittedDate(latestDate)
    } else {
      setCommittedDate('')
    }
    setCurrentPage(1)
  }

  const handleSortChange = (column: TSort) => {
    if (sortColumn === column) {
      setSortAsc((prev) => !prev)
    } else {
      setSortColumn(column)
      setSortAsc(true)
    }
    setCurrentPage(1)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setCurrentPage(1)
  }

  return {
    searchInput,
    setSearchInput,
    currentPage,
    setCurrentPage,
    sortColumn,
    sortAsc,
    dateMode,
    dateInput,
    committedDate,
    showActions,
    isInternal,
    isExternal,
    isTopologyTypeLoading,
    handleDateInputChange,
    handleDateModeChange,
    handleSortChange,
    handleSearchClear,
  }
}
