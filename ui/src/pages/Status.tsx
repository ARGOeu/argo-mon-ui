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
          <header className="text-center">
            <h1 className="text-2xl text-center font-semibold">
              {status.data.name}
            </h1>
          </header>
          <div className="min-h-[60px]"></div>
          <main className="mt-">
            {status.data.config.groups &&
              status.data.config.groups.map((group) => (
                <div className="mt-4">
                  <ViewGroup
                    key={group.name}
                    name={group.name}
                    alias={group.alias || ''}
                    items={group.list}
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
