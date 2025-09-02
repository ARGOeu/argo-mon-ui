import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import React, { useEffect, useMemo, useRef } from "react";
import type { GroupStatus } from "../types/common";
// adjust import path to your setup:


type DoneListProps = {
  /** Stable identifier of this list (e.g., "Done", "QA", "Blocked") */
  id: string;
  /** Items for this list */
  items: GroupStatus[];
  /** All interoperable lists must share the same group */
  group: string;

  title?: string;

  /** Called when DnD changes the order or content of this list */
  onItemsChange?: (id: string, nextItems: GroupStatus[]) => void;

  /** Optional actions */
  onRemove?: (id: string) => void;
  onRename?: (id: string, nextTitle: string) => void;

  /** Custom item renderer */
  renderItem?: (item: GroupStatus) => React.ReactNode;

  className?: string;
};

function shallowArrayEqual<A>(
  a: A[] | null | undefined,
  b: A[] | null | undefined,
  by: (x: A, i: number) => unknown = (x) => x
) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (by(a[i], i) !== by(b[i], i)) return false;
  return true;
}

/**
 * DoneList<GroupStatus>
 * - Owns its useDragAndDrop hook (safe for dynamic mount/unmount).
 * - Uses item.name as the unique key.
 * - Emits onItemsChange only when the array meaningfully changes.
 */
export default function DoneList({
  id,
  items,
  group,
  title,
  onItemsChange,
  onRemove,
  onRename,
  renderItem,
  className,
}: DoneListProps) {
  const [listRef, orderedItems] = useDragAndDrop<HTMLUListElement, GroupStatus>(
    items,
    { group, },
    
  );

  // Notify parent when DnD reorders/moves items (avoid loops)
  const prev = useRef<GroupStatus[] | null>(null);
  useEffect(() => {
    const changed = !shallowArrayEqual(prev.current, orderedItems, (x) => x.name);
    if (changed) {
      prev.current = orderedItems;
      onItemsChange?.(id, orderedItems);
    }
  }, [id, orderedItems, onItemsChange]);

  const render = useMemo(
    () =>
      renderItem ??
      ((item: GroupStatus) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          <span className="text-xs text-neutral-500">{item.status}</span>
        </div>
      )),
    [renderItem]
  );

  return (
    <section
      className={
        className ??
        "flex w-64 min-w-56 max-w-72 flex-col rounded-2xl border shadow-sm bg-white"
      }
      data-list-id={id}
    >
      <header className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-semibold truncate" title={title ?? id}>
          {title ?? id}
        </h3>
        <div className="flex items-center gap-1">
          {onRename && (
            <button
              type="button"
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100"
              onClick={() => {
                const next = window.prompt("Rename list", title ?? id);
                if (next && next.trim()) onRename(id, next.trim());
              }}
            >
              Rename
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600"
              onClick={() => onRemove(id)}
            >
              Remove
            </button>
          )}
        </div>
      </header>

      <ul
        ref={listRef}
        className="flex flex-col gap-1 p-4 min-h-[100px]"
        aria-label={title ?? id}
        role="list"
      >
        {orderedItems.length === 0 && (
          <li className="text-xs text-neutral-500 px-2 py-3 min-h-[100px] rounded border border-dashed">
            Drop items here
          </li>
        )}

        {orderedItems.map((item) => (
          <li
            key={item.name} // name is unique
            className="rounded border px-2 py-2 text-sm bg-white hover:bg-neutral-50 cursor-grab active:cursor-grabbing"
            data-item-name={item.name}
          >
            {render(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}