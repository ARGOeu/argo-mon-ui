import ViewGroup from '@/components/ViewGroup'
import { useGetStatusQuery } from '@/hooks/useStatus'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import { useParams } from 'react-router-dom'

export const Status = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: statusData, isLoading } = useGetStatusQuery(slug || '')

  return (
    <div className="container bg-white rounded mt-4 mx-auto max-w-3xl  p-4">
      {isLoading ? (
        <div className="flex-row flex align-middle justify-center mt-6 container mx-auto">
          <div className="me-2">
            <ArrowPathIcon className="size-6 animate-spin" />
          </div>
          <div className="text-3lg">Loading ... </div>
        </div>
      ) : statusData ? (
        <>
          <header
            className="text-center rounded-t-lg p-2"
            style={{
              backgroundColor: statusData.theming?.color || '#ffffff',
            }}
          >
            <div className="flex flex-row justify-between">
              <div></div>
              <div className="flex flex-row gap-2 mb-2 items-baseline">
                {statusData.theming?.logo && (
                  <img src={statusData.theming?.logo} className="me-4" />
                )}
                <h1 className="text-2xl font-semibold">{statusData.title}</h1>
              </div>
              <div></div>
            </div>
            <h2 className="text-center">{statusData.description || ''}</h2>
          </header>
          <main>
            {statusData.groups &&
              statusData.groups.map((group) => (
                <div className="mt-4">
                  <ViewGroup
                    columns={statusData?.theming?.columns || 'one'}
                    key={group.name}
                    name={group.name}
                    alias={group.alias || ''}
                    items={group.list}
                    iconMode={statusData?.theming?.status.icon || 'led'}
                    textMode={statusData?.theming?.status.text || 'none'}
                  />
                </div>
              ))}
          </main>
        </>
      ) : (
        <div>error</div>
      )}
    </div>
  )
}
