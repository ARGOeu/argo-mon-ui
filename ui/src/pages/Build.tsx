import {
  ArrowsPointingOutIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  CubeIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/16/solid'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useReportsMutation } from '../hooks/useReports'
import { useGroupsMutation } from '../hooks/useGroups'
import type { DataSource, GroupStatus, StatusGroup } from '../types/common'
import { useDragAndDrop } from "@formkit/drag-and-drop/react";

/** ---------- Child component: owns its own hook (fixes "Rendered more hooks..." issue) ---------- */
function StatusColumn({
  name,
  items,
  group,
  getStatusClass,
  onItemsChange,
  onRename,
  onRemove,
}: {
  name: string;
  items: GroupStatus[];
  group: string;
  getStatusClass: (s: string) => string;
  onItemsChange: (nextItems: GroupStatus[]) => void;
  onRename: (nextName: string) => void;
  onRemove: () => void;
}) {
  const [listRef, orderedItems] = useDragAndDrop<HTMLUListElement, GroupStatus>(items, { group, dragHandle: '.dnd-handle' });

  // notify parent when DnD changes this column's content/order
  const prev = useRef<GroupStatus[] | null>(null);
  useEffect(() => {
    if (prev.current !== orderedItems) {
      prev.current = orderedItems;
      onItemsChange(orderedItems);
    }
  }, [orderedItems, onItemsChange]);

  return (
    <div className="border-neutral-200 border-2 m-2 rounded">
      <div className="flex flex-row justify-between align-middle bg-neutral-100 p-2 rounded-t">
        <input
          value={name}
          onChange={(e) => onRename(e.target.value ?? "")}
          className="input input-sm"
        />
        <button className="btn btn-dash" onClick={onRemove}>Remove</button>
      </div>
      <div className="min-h-[100px]">
        <ul key={name} ref={listRef}>
          {orderedItems.map((sitem) => (
            <li key={sitem.name}>
              <div className="border rounded p-2 my-2 shadow">
                <div className="flex flex-row items-center justify-between">
                  <div className="dnd-handle cursor-grab">⋮⋮</div>
                  <div>{sitem.name}</div>
                  <div className="tooltip tooltip-left" data-tip={sitem.status}>
                    <div aria-label="status" className={getStatusClass(sitem.status)}></div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {orderedItems.length === 0 && (
            <li className="text-xs text-neutral-500 px-2 py-3 rounded border border-dashed m-2">
              Drop items here
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}


export const Build = () => {
  const [dataSource, setDataSource] = useState<DataSource>({
    api: '',
    secret: '',
  })

  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);
  const [report, setReport] = useState("");

  const groupsMutation = useGroupsMutation();
  const [filterItems, setFilterItems] = useState("");
  const reportsMutation = useReportsMutation();

  const handleAddStatusGroup = () => {
    setStatusGroups(prev => [
      ...prev,
      { name: `group-${prev.length + 1}`, list: [] }
    ]);
  }

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
    return statusMap[status] ?? "status status-neutral status-lg";
  }

  const fl = filterItems.trim().toLowerCase();

  // LEFT column (source items). Give it the same group to enable cross-list dragging.
  const groupName = "status-board";
  const [parent, items, setItems] = useDragAndDrop<HTMLUListElement, GroupStatus>([], { group: groupName, dragHandle: '.dnd-handle' });

  useEffect(() => {
    if (groupsMutation.data) setItems(groupsMutation.data);
  }, [groupsMutation.data, setItems]);

  const groupsFiltered =
  fl !== ""
    ? items.filter(item =>
        `${item.name} ${item.status}`.toLowerCase().includes(fl)
      )
    : items;

  /** When a column changes, update that column, de-dup across all columns, and keep LEFT list in sync. */
  const updateColumn = (colIndex: number, nextItems: GroupStatus[]) => {
  setStatusGroups(prev => {
    const movedNames = new Set(nextItems.map(it => it.name));

    const next = prev.map((g, i) =>
      i === colIndex
        ? { ...g, list: nextItems }                   // keep original status
        : { ...g, list: g.list.filter(it => !movedNames.has(it.name)) }
    );

    // remove moved items from the LEFT list
    setItems(curr => curr.filter(it => !movedNames.has(it.name)));

    return next;
  });
};

  /** If a column is renamed, update its name and also update the status of items inside it. */
  const renameColumn = (colIndex: number, nextName: string) => {
    setStatusGroups(prev =>
      prev.map((g, i) =>
        i === colIndex ? { ...g, name: nextName, list: g.list.map(it => ({ ...it, status: nextName })) } : g
      )
    );
  };

  const removeColumn = (colIndex: number) => {
  setStatusGroups(prev => {
    const removed = prev[colIndex]?.list ?? [];

    if (removed.length) {
      setItems(curr => {
        const leftIndex = leftIndexRef.current;

        // avoid duplicates
        const currNames = new Set(curr.map(x => x.name));
        const toReturn = removed.filter(it => !currNames.has(it.name));

        // merge with current left list
        const merged = [...curr, ...toReturn];

        // sort by previously recorded index; unknowns go to the end (stable tiebreaker by name)
        const FALLBACK = Number.MAX_SAFE_INTEGER / 2;
        merged.sort((a, b) => {
          const ia = leftIndex.get(a.name) ?? FALLBACK;
          const ib = leftIndex.get(b.name) ?? FALLBACK;
          if (ia !== ib) return ia - ib;
          return a.name.localeCompare(b.name);
        });

        return merged;
      });
    }

    // finally remove the column
    return prev.filter((_, i) => i !== colIndex);
  });
};

/** remembers each item's last position in the LEFT list */
const leftIndexRef = useRef<Map<string, number>>(new Map());

/** whenever LEFT list order changes, record indices for items currently present */
useEffect(() => {
  items.forEach((it, idx) => leftIndexRef.current.set(it.name, idx));
}, [items]);

  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Build</h1>
        <button className="btn btn-outline btn-neutral" onClick={handleAddStatusGroup}>
          Add Group
        </button>
      </div>

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
                        <option key={item.name}>{item.name}</option>
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
                          <ul ref={parent}>
                            {(groupsFiltered ?? []).map(group => (
                              <li key={group.name}>
                                <div className="border rounded p-2 my-2 shadow">
                                  <div className="flex flex-row items-center justify-between">
                                    <div className="dnd-handle cursor-grab px-1">⋮⋮</div>
                                    <div>{group.name}</div>
                                    <div className="tooltip tooltip-left" data-tip={group.status}>
                                      <div aria-label="status" className={getStatusClass(group.status)}></div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                            {(groupsFiltered ?? []).length === 0 && (
                              <li className="text-xs text-neutral-500 px-2 py-3 rounded border border-dashed">
                                No items
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    )}
                  </fieldset>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Status Columns */}
        <div className="border-dashed border border-neutral-300 rounded-xl p-4">
          <div className="flex flex-wrap">
            {statusGroups.map((col, index) => (
              <StatusColumn
  key={col.name}
  name={col.name}
  items={col.list}
  group={groupName}
  getStatusClass={getStatusClass}
  onItemsChange={(next) => updateColumn(index, next)}
  onRename={(nextName) => renameColumn(index, nextName)}
  onRemove={() => removeColumn(index)}  // ← returns items to LEFT list
/>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}