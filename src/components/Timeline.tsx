interface TimelineItem {
  label: string
  title: string
  text: string
}

/** Vertical on phones, three columns on larger screens. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.label} className="relative rounded-card border border-line bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-700 font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wide text-mint-700">{item.label}</span>
          </div>
          <h3 className="text-xl">{item.title}</h3>
          <p className="mt-2 text-slate">{item.text}</p>
        </li>
      ))}
    </ol>
  )
}
