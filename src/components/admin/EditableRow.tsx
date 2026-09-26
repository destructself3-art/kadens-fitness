"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";
import { miniBtn } from "./styles";

/**
 * A table row with an "Изменить" toggle that opens a full-width row of controls under it.
 * Cells and the panel are rendered on the server and passed in; only the open state lives here.
 */
export function EditableRow({
  children,
  panel,
  actions,
  colSpan,
  label,
  muted = false,
}: {
  children: ReactNode;
  panel: ReactNode;
  /** Extra links next to the toggle */
  actions?: ReactNode;
  colSpan: number;
  /** What the row is, for the toggle's accessible name */
  label: string;
  muted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <tr className={clsx("border-t border-line/10 transition-colors hover:bg-chalk/[0.025]", open && "bg-chalk/[0.035]", muted && "text-dust")}>
        {children}
        <td className="px-4 py-2.5 align-middle">
          <div className="flex items-center justify-end gap-2">
            {actions}
            <button
              type="button"
              aria-expanded={open}
              aria-controls={open ? id : undefined}
              aria-label={`${open ? "Скрыть управление" : "Изменить"}: ${label}`}
              onClick={() => setOpen((v) => !v)}
              className={clsx(miniBtn, open && "border-chalk bg-chalk text-asphalt hover:bg-chalk/90")}
            >
              {open ? "Скрыть" : "Изменить"}
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr id={id} className="bg-chalk/[0.035]">
          <td colSpan={colSpan} className="px-4 pb-6 pt-2">
            {panel}
          </td>
        </tr>
      )}
    </>
  );
}
