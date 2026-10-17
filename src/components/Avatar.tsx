/** Photo if there is one, otherwise the person's initials in a mint circle. */
export function Avatar({ name, photo, size = 56 }: { name: string; photo?: string; size?: number }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="shrink-0 rounded-full border border-line object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  const words = name.trim().split(/\s+/)
  const initials = ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-mint-200 font-bold text-mint-900"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  )
}
