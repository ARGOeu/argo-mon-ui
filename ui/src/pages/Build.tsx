import { CircleStackIcon, Cog6ToothIcon, CubeIcon } from '@heroicons/react/16/solid'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useReportsMutation } from '../hooks/useReports'
import { useGroupsMutation } from '../hooks/useGroups'

export const Build = () => {
  type DataSource = {
    api: string
    secret: string
  }

  const [dataSource, setDataSource] = useState<DataSource>({
    api: '',
    secret: '',
  })

  const [report, setReport] = useState("");

  const groupsMutation = useGroupsMutation();
  const [filterItems, setFilterItems] = useState("");
  const reportsMutation = useReportsMutation();

  const handleReportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReport(event.target.value);
  };

  useEffect(() => {
    groupsMutation.mutate({ ...dataSource, report: report })
  }, [report])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    reportsMutation.mutate(dataSource)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target
    setDataSource((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getStatusClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      "OK": "status status-success status-lg",
      "MISSING": "status status-info status-lg",
      "DOWNTIME": "status status-neutral status-lg",
      "WARNING": "status status-warning status-lg",
      "UNKNOWN": "status status-unknown status-lg",
      "CRITICAL": "status status-error status-lg"
    }
    return statusMap[status];
  }
  const fl = filterItems.trim().toLowerCase();
  const groupsFiltered = groupsMutation.data && fl !== ""
    ? groupsMutation.data.filter(
      item => `${item.name} ${item.status}`.toLowerCase().includes(fl)
    )
    : groupsMutation.data ?? []


  return (
    <div>
      <h1 className="text-2xl font-semibold">Build</h1>
      <div className="grid grid-cols-[auto_1fr] gap-4 mt-4">

        <div className="w-[370px]">
         
            <div className="tabs tabs-lift">
              <label className="tab">
                <input type="radio" name="build_tabs" defaultChecked />
                <Cog6ToothIcon className="size-4 me-2" />
                Config
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">

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


                </fieldset>

                {reportsMutation.error && (
                  <div className="mt-4 p-4 bg-red-100 rounded">
                    Error: {reportsMutation.error.message}
                  </div>
                )}

              </div>

              <label className="tab">
                <input type="radio" name="build_tabs" />
                <CubeIcon className="size-4 me-2" />
                Items
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">

                {reportsMutation.data && (
                  <>
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                      <label className="label">Report:</label>

                      <select defaultValue="Select a report" className="select" onChange={handleReportChange}>
                        <option disabled={true}>Select a report</option>
                        {reportsMutation.data.map((item) => (
                          <option>{item.name}</option>
                        ))}
                      </select>

                      {groupsMutation.data && (
                        <>
                          <label className="label mt-2">Items:</label>

                          <input
                            type="text"
                            className="input"
                            placeholder="Search..."
                            name="filter"
                            value={filterItems}
                            onChange={(e) => { setFilterItems(e.target.value) }}
                          />

                          <div className="mt-2 max-h-[500px] overflow-x-scroll">
                            {groupsFiltered && groupsFiltered.map(group => <div key={group.name} className="border rounded p-2 my-2 shadow">
                              <div className="flex flex-row items-center justify-between">
                                <div>{group.name}</div>
                                <div className="tooltip tooltip-left" data-tip={group.status}><div aria-label="status" className={getStatusClass(group.status)}></div></div>
                              </div>
                            </div>)}

                          </div>
                        </>
                      )}
                    </fieldset>
                  </>
                )}

              </div>
            </div>


          
        </div>

        {/* Status page under construction */}
        <div className="border-dashed border border-neutral-300 rounded-xl p-4">
          Right Content
        </div>
      </div>



    </div>
  )
}
