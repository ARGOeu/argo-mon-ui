import ViewGroup from '@/components/ViewGroup'
import { useGetStatusQuery } from '@/hooks/useStatus'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import { useParams } from 'react-router-dom'

export const Status = () => {
  const { slug } = useParams<{ slug: string }>()

  const status = useGetStatusQuery(slug || '')

  return (
    <div className="container bg-white rounded mt-4 mx-auto max-w-3xl  p-4">
      {status.isPending ? (
        <div className="flex-row flex align-middle justify-center mt-6 container mx-auto">
          <div className="me-2">
            <ArrowPathIcon className="size-6 animate-spin" />
          </div>
          <div className="text-3lg"> Loading ... </div>
        </div>
      ) : status.isSuccess && status.data && status.data.config ? (
        <>
          <header
            className="text-center rounded-t-lg p-2 "
            style={{
              backgroundColor: status.data.config.theming?.color || '#ffffff',
            }}
          >
            <div className="flex flex-row justify-between">
              <div></div>
              <div className="flex flex-row gap-2 mb-2 items-baseline">
                {status.data.config.theming?.logo && (
                  <img
                    src={status.data.config.theming?.logo}
                    className="me-4"
                  />
                )}
                <h1 className="text-2xl font-semibold">
                  {status.data.config.title || status.data.name}
                </h1>
              </div>
              <div></div>
            </div>
            <h2 className="text-center">
              {status.data.config.description || ''}
            </h2>
          </header>
          <div className="min-h-[60px]"></div>
          <main className="mt-">
            {status.data.config.groups &&
              status.data.config.groups.map((group) => (
                <div className="mt-4">
                  <ViewGroup
                    columns={status.data.config?.theming?.columns || 'one'}
                    key={group.name}
                    name={group.name}
                    alias={group.alias || ''}
                    items={group.list}
                    iconMode={status.data.config?.theming?.status.icon || 'led'}
                    textMode={
                      status.data.config?.theming?.status.text || 'none'
                    }
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
