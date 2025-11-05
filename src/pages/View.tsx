import { useGetAllPagesQuery } from '@/hooks/usePages'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { LoginPrompt } from '@/components/LoginPrompt'

export const View = () => {
  const { authenticated, login } = useAuth()
  const { data } = useGetAllPagesQuery()

  if (!authenticated) {
    return (
      <LoginPrompt
        title="View Your Status Pages"
        description="Login to view and manage all your status pages"
        onLogin={login}
      />
    )
  }

  console.log('View component data:', data)
  console.log('Pages data:', data)

  return (
    <div>
      <h1 className="text-2xl font-semibold">View</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Path</th>
              <th>Report</th>
              <th>Endpoint</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data?.content &&
              data.content?.length > 0 &&
              data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex flex-row items-center">
                      <DocumentIcon className="text-green-500 size-6 me-2" />
                      <strong>
                        <Link
                          className="border-b border-dashed hover:bg-gray-100"
                          to={`/build/${item.id}`}
                        >
                          {item.name}
                        </Link>
                      </strong>
                    </div>
                  </td>
                  <td>
                    <code>
                      <a
                        className="border-b border-dashed hover:bg-gray-100"
                        href={`/status/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.slug}
                        <ArrowTopRightOnSquareIcon className="size-4 inline-block ms-1" />
                      </a>
                    </code>
                  </td>
                  <td>{item.report}</td>
                  <td>{}</td>
                  <td>{item.updated_at}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
