import { CircleStackIcon } from '@heroicons/react/16/solid'
import { useState, type ChangeEvent } from 'react'
import { useReportsMutation } from '../hooks/useReports'

export const Build = () => {
  type DataSource = {
    api: string
    secret: string
  }

  const [dataSource, setDataSource] = useState<DataSource>({
    api: '',
    secret: '',
  })

  const reportsMutation = useReportsMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    reportsMutation.mutate(dataSource)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    console.log(e.target)
    const { name, value } = e.target
    console.log(name, value)
    setDataSource((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Build</h1>
      <div className="ms-4 mt-2">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">
            <CircleStackIcon className="size-4" />
            Data Source
          </legend>

          <label className="label">Argo-web-api endpoint (URL):</label>
          <input
            type="text"
            className="input"
            placeholder="https://"
            name="api"
            value={dataSource.api}
            onChange={handleInputChange}
          />

          <label className="label">Access Token:</label>
          <input
            type="password"
            className="input"
            placeholder="s3cr3t"
            name="secret"
            value={dataSource.secret}
            onChange={handleInputChange}
          />

          <button className="btn btn-light mt-2" onClick={handleSubmit}>
            {reportsMutation.data ? 'Connected' : 'Connect'}
          </button>

          {reportsMutation.data && (
            <>
              <label className="label mt-2">Report:</label>

              <select defaultValue="Select a report" className="select">
                <option disabled={true}>Select a report</option>
                {reportsMutation.data.map((item) => (
                  <option>{item.name}</option>
                ))}
              </select>
            </>
          )}
        </fieldset>
      </div>

      {reportsMutation.error && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          Error: {reportsMutation.error.message}
        </div>
      )}
    </div>
  )
}
