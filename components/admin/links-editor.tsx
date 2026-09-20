"use client";

import { inputClass, labelClass } from "@/components/admin/form-utils";

type LinkItem = { id: string; label: string; href: string };

export function LinksEditor<T extends LinkItem>({
  items,
  onChange,
  addLabel,
  emptyHint,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  addLabel: string;
  emptyHint?: string;
}) {
  function update(index: number, patch: Partial<LinkItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{emptyHint || "None yet."}</p>
      ) : null}
      {items.map((item, index) => (
        <div key={item.id} className="grid gap-3 border border-[var(--line)] p-4 sm:grid-cols-[1fr_1.4fr_auto]">
          <label className={labelClass}>
            Label
            <input
              value={item.label}
              onChange={(event) => update(index, { label: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            URL
            <input
              value={item.href}
              onChange={(event) => update(index, { href: event.target.value })}
              className={inputClass}
            />
          </label>
          <button
            type="button"
            className="self-end text-sm text-[var(--accent-2)]"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="w-fit text-sm text-[var(--accent)]"
        onClick={() =>
          onChange([...items, { id: crypto.randomUUID(), label: "", href: "" } as T])
        }
      >
        {addLabel}
      </button>
    </div>
  );
}
