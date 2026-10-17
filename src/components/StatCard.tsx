export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-center">
      <p className="text-2xl font-bold tracking-heading text-mint-900 md:text-3xl">{value}</p>
      <p className="mt-1 text-slate">{label}</p>
    </div>
  )
}
