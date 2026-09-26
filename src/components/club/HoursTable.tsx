import clsx from "clsx";

export type HoursGroup = { place: string; rows: { days: string; time: string }[] };

/** Opening hours as a real table: place, days, time. Scrolls inside its own box on narrow screens. */
export function HoursTable({ groups, caption, className }: { groups: HoursGroup[]; caption: string; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="w-full min-w-[320px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Где</th>
            <th scope="col">Дни</th>
            <th scope="col">Время</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) =>
            g.rows.map((r, i) => (
              <tr key={`${g.place}-${r.days}`} className={clsx(i === 0 && "border-t border-line/10")}>
                {i === 0 && (
                  <th scope="row" rowSpan={g.rows.length} className="py-3 pr-4 align-top text-[14.5px] font-medium text-chalk">
                    {g.place}
                  </th>
                )}
                <td className="py-3 pr-4 align-top text-[14.5px] text-dust">{r.days}</td>
                <td className="py-3 text-right align-top">
                  <span className="digits whitespace-nowrap text-[24px] leading-none text-chalk">{r.time}</span>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
