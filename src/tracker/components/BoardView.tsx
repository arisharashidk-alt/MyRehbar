import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ImagePlus, Pin, Plus, Scissors, Spline, Trash2, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { formatDate } from '../../data'
import { useI18n } from '../../i18n'
import { BOARD_HEIGHT, BOARD_WIDTH, LIMITS, NOTE_COLORS, NOTE_WIDTH, newId, type Note, type NoteColor, type TrackerData } from '../model'
import { addNote, placeNote, removeNote } from '../actions'
import { thumbnail } from '../images'
import { APP_COLOR_CLASSES, URGENCY_CLASSES, estimateDeadline, urgency } from '../plan'
import { useTrackerText } from '../text'
import { Monogram, chipButtonClass, iconButtonClass, smallInputClass } from './ui'

type Update = (fn: (d: TrackerData) => TrackerData) => void
type Selection = { type: 'note' | 'thread'; id: string } | null

const NOTE_CLASSES: Record<NoteColor, string> = {
  yellow: 'bg-note-yellow',
  pink: 'bg-note-pink',
  blue: 'bg-note-blue',
  green: 'bg-note-green',
  white: 'bg-white',
}

/** Where the thread is tied: the pin at the top centre of each note. */
const pinPoint = (n: { x: number; y: number }) => ({ x: n.x + NOTE_WIDTH / 2, y: n.y + 14 })

/** A slightly sagging string between two pins. */
function threadPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const midX = (a.x + b.x) / 2
  const midY = Math.max(a.y, b.y) + Math.min(120, 24 + dist * 0.12)
  return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`
}

/** A small, steady tilt per note so the board looks hand-pinned. */
function tilt(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0
  return ((Math.abs(h) % 5) - 2) * 0.8
}

export function BoardView({ data, update, onOpen }: { data: TrackerData; update: Update; onOpen: (id: string) => void }) {
  const tt = useTrackerText()
  const { lang } = useI18n()
  const b = tt.board
  const scrollRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<Selection>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; offX: number; offY: number; startX: number; startY: number; moved: boolean } | null>(null)
  const [message, setMessage] = useState('')
  const [pinApp, setPinApp] = useState('')

  const selectedNote = selected?.type === 'note' ? data.notes.find((n) => n.id === selected.id) : undefined
  const apps = new Map(data.applications.map((a) => [a.id, a]))
  const unpinned = data.applications.filter((a) => !data.notes.some((n) => n.appId === a.id))
  const position = (n: Note) => (drag?.id === n.id ? { x: drag.x, y: drag.y } : { x: n.x, y: n.y })

  // Esc stops connecting; Delete removes what is selected (when not typing).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectFrom(null)
        setConnectMode(false)
      }
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selected?.type === 'thread') {
        update((d) => ({ ...d, threads: d.threads.filter((t) => t.id !== selected.id) }))
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, update])

  function view() {
    const el = scrollRef.current
    return { x: el?.scrollLeft ?? 0, y: el?.scrollTop ?? 0 }
  }

  function newNote(appId?: string) {
    if (data.notes.length >= LIMITS.notes) return setMessage(b.full.replace('{count}', String(LIMITS.notes)))
    const v = view()
    const id = newId()
    update((d) => addNote({ id, ...placeNote(d.notes, v.x, v.y), color: appId ? 'white' : 'yellow', text: '', appId })(d))
    setSelected({ type: 'note', id })
    // Focus the new note's text once it is on the board.
    window.setTimeout(() => boardRef.current?.querySelector<HTMLElement>(`[data-note="${id}"] textarea`)?.focus(), 0)
  }

  function connect(id: string) {
    if (!connectFrom) return setConnectFrom(id)
    if (connectFrom !== id) {
      const from = connectFrom
      update((d) =>
        d.threads.length >= LIMITS.threads || d.threads.some((t) => (t.from === from && t.to === id) || (t.from === id && t.to === from))
          ? d
          : { ...d, threads: [...d.threads, { id: newId(), from, to: id }] },
      )
    }
    setConnectFrom(null)
  }

  function onHandleDown(e: PointerEvent<HTMLButtonElement>, n: Note) {
    if (e.button !== 0) return
    const rect = boardRef.current!.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: n.id, x: n.x, y: n.y, offX: e.clientX - rect.left - n.x, offY: e.clientY - rect.top - n.y, startX: e.clientX, startY: e.clientY, moved: false })
  }

  function onHandleMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const rect = boardRef.current!.getBoundingClientRect()
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4
    setDrag({
      ...drag,
      moved,
      x: Math.round(Math.min(BOARD_WIDTH - NOTE_WIDTH, Math.max(0, e.clientX - rect.left - drag.offX))),
      y: Math.round(Math.min(BOARD_HEIGHT - 80, Math.max(0, e.clientY - rect.top - drag.offY))),
    })
  }

  function onHandleUp(n: Note) {
    if (!drag) return
    const { moved, x, y } = drag
    setDrag(null)
    if (moved) update((d) => ({ ...d, notes: d.notes.map((m) => (m.id === n.id ? { ...m, x, y } : m)) }))
    else if (connectMode) connect(n.id)
    else setSelected({ type: 'note', id: n.id })
  }

  function onHandleKey(e: KeyboardEvent<HTMLButtonElement>, n: Note) {
    const step = e.shiftKey ? 50 : 10
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const m = moves[e.key]
    if (m) {
      e.preventDefault()
      const dx = document.documentElement.dir === 'rtl' ? -m[0] : m[0]
      update((d) => ({
        ...d,
        notes: d.notes.map((x) =>
          x.id === n.id ? { ...x, x: Math.min(BOARD_WIDTH - NOTE_WIDTH, Math.max(0, x.x + dx)), y: Math.min(BOARD_HEIGHT - 80, Math.max(0, x.y + m[1])) } : x,
        ),
      }))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (connectMode) connect(n.id)
      else setSelected({ type: 'note', id: n.id })
    }
  }

  const patchNote = (id: string, change: Partial<Note>) => update((d) => ({ ...d, notes: d.notes.map((n) => (n.id === id ? { ...n, ...change } : n)) }))

  async function onImage(file: File | undefined) {
    if (!file || !selectedNote) return
    const url = await thumbnail(file)
    if (!url) return setMessage(b.imageTooBig)
    setMessage('')
    patchNote(selectedNote.id, { image: url })
  }

  function deleteSelected() {
    if (selected?.type === 'thread') {
      update((d) => ({ ...d, threads: d.threads.filter((t) => t.id !== selected.id) }))
      setSelected(null)
    } else if (selectedNote && window.confirm(b.confirmRemove)) {
      update(removeNote(selectedNote.id))
      setSelected(null)
    }
  }

  return (
    <div>
      <p className="mb-4 text-slate">{b.intro}</p>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card border border-line bg-white p-2">
        <Button size="sm" onClick={() => newNote()} icon={<Plus aria-hidden size={16} strokeWidth={1.5} />}>
          {b.addNote}
        </Button>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Pin aria-hidden size={16} strokeWidth={1.5} className="text-slate" />
          <span className="sr-only">{b.pinApp}</span>
          <select
            value={pinApp}
            onChange={(e) => {
              setPinApp('')
              if (e.target.value) newNote(e.target.value)
            }}
            className={`${smallInputClass} w-56`}
            disabled={unpinned.length === 0}
          >
            <option value="">{b.pinApp}…</option>
            {unpinned.map((a) => (
              <option key={a.id} value={a.id}>
                {a.program ? `${a.name} · ${a.program}` : a.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-pressed={connectMode}
          onClick={() => {
            setConnectMode((m) => !m)
            setConnectFrom(null)
          }}
          className={`${chipButtonClass} ${connectMode ? 'border-red-700 bg-red-50 text-red-700' : ''}`}
        >
          <Spline aria-hidden size={16} strokeWidth={1.5} />
          {b.connect}
        </button>

        {selectedNote && (
          <div className="flex flex-wrap items-center gap-1 border-s border-line ps-2">
            <fieldset className="flex items-center gap-1">
              <legend className="sr-only">{b.color}</legend>
              {NOTE_COLORS.map((c) => (
                <label key={c} className="inline-flex min-h-tap min-w-[32px] cursor-pointer items-center justify-center">
                  <input type="radio" name="note-color" checked={selectedNote.color === c} onChange={() => patchNote(selectedNote.id, { color: c })} className="peer sr-only" />
                  <span className={`h-6 w-6 rounded-full border border-line ${NOTE_CLASSES[c]} peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-mint-700`} />
                  <span className="sr-only">{tt.noteColors[c]}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" className={chipButtonClass} onClick={() => fileRef.current?.click()}>
              <ImagePlus aria-hidden size={16} strokeWidth={1.5} />
              {b.addImage}
            </button>
            {selectedNote.image && (
              <button type="button" className={chipButtonClass} onClick={() => patchNote(selectedNote.id, { image: undefined })}>
                <X aria-hidden size={16} strokeWidth={1.5} />
                {b.removeImage}
              </button>
            )}
            <button type="button" className={`${iconButtonClass} hover:text-danger`} onClick={deleteSelected}>
              <Trash2 aria-hidden size={18} strokeWidth={1.5} />
              <span className="sr-only">{b.remove}</span>
            </button>
          </div>
        )}
        {selected?.type === 'thread' && (
          <button type="button" className={`${chipButtonClass} border-s text-red-700`} onClick={deleteSelected}>
            <Scissors aria-hidden size={16} strokeWidth={1.5} />
            {b.removeThread}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => {
          void onImage(e.target.files?.[0])
          e.target.value = ''
        }} />
      </div>

      <p role="status" aria-live="polite" className={`mb-3 text-sm font-semibold ${message ? 'text-danger' : connectMode ? 'text-red-700' : 'sr-only'}`}>
        {message || (connectMode ? (connectFrom ? b.connecting : b.connectHint) : '')}
      </p>

      {/* The board */}
      <div ref={scrollRef} className="h-[70vh] min-h-[420px] overflow-auto rounded-card border border-line">
        <div
          ref={boardRef}
          className="cork-board relative"
          style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
          onPointerDown={(e) => {
            if (e.target === boardRef.current) setSelected(null)
          }}
        >
          {data.notes.length === 0 && (
            <p className="absolute start-10 top-10 max-w-sm rounded-xl bg-white/90 p-4 text-slate shadow-sm">{b.empty}</p>
          )}

          {data.notes.map((n) => {
            const pos = position(n)
            const app = n.appId ? apps.get(n.appId) : undefined
            const isSelected = selected?.type === 'note' && selected.id === n.id
            const isFrom = connectFrom === n.id
            const dragging = drag?.id === n.id && drag.moved
            const deadline = app ? app.deadline ?? estimateDeadline(app.semester) : ''
            return (
              <div
                key={n.id}
                data-note={n.id}
                className={`absolute flex flex-col rounded-md ${NOTE_CLASSES[n.color]} ${
                  dragging ? 'z-30 shadow-[0_16px_32px_rgba(0,0,0,0.3)]' : isSelected ? 'z-20 shadow-[0_8px_20px_rgba(0,0,0,0.25)]' : 'z-10 shadow-[0_3px_8px_rgba(0,0,0,0.2)]'
                } ${isSelected ? 'ring-2 ring-mint-700' : ''}`}
                style={{ left: pos.x, top: pos.y, width: NOTE_WIDTH, transform: dragging ? 'rotate(0deg)' : `rotate(${tilt(n.id)}deg)` }}
                onPointerDown={() => !isSelected && setSelected({ type: 'note', id: n.id })}
              >
                {/* Pin: drag handle, and the end of any thread */}
                <button
                  type="button"
                  className={`flex h-8 w-full touch-none items-center justify-center rounded-t-md ${connectMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                  onPointerDown={(e) => onHandleDown(e, n)}
                  onPointerMove={onHandleMove}
                  onPointerUp={() => onHandleUp(n)}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(e) => onHandleKey(e, n)}
                  aria-pressed={connectMode ? isFrom : undefined}
                >
                  <span
                    aria-hidden
                    className={`mt-1 block h-4 w-4 rounded-full border-2 border-white shadow ${isFrom ? 'bg-mint-500 ring-4 ring-mint-200' : 'bg-red-700'}`}
                  />
                  <span className="sr-only">
                    {connectMode ? b.connectHint : b.move} {app?.name ?? n.text.slice(0, 40)}
                  </span>
                </button>

                <div className="flex flex-col gap-2 px-3 pb-3">
                  {app && (
                    <button type="button" onClick={() => onOpen(app.id)} className="flex items-start gap-2 rounded-lg bg-white/70 p-2 text-start hover:bg-white">
                      <Monogram name={app.name} className={`h-10 w-10 text-sm ${APP_COLOR_CLASSES[app.color].solid}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-mint-900">{app.name}</span>
                        {app.program && <span className="block truncate text-xs text-slate">{app.program}</span>}
                        <span className={`mt-1 inline-block rounded-full border px-1.5 text-[11px] font-semibold ${URGENCY_CLASSES[urgency(deadline, ['submitted', 'interview', 'offer', 'accepted'].includes(app.status))].chip}`}>
                          {b.deadline.replace('{date}', formatDate(deadline, lang) ?? deadline)}
                        </span>
                      </span>
                    </button>
                  )}
                  {n.image && <img src={n.image} alt="" className="w-full rounded border border-black/10" draggable={false} />}
                  <label className="block">
                    <span className="sr-only">{b.notePlaceholder}</span>
                    <textarea
                      value={n.text}
                      rows={app ? 2 : 4}
                      maxLength={LIMITS.longText}
                      placeholder={b.notePlaceholder}
                      onFocus={() => setSelected({ type: 'note', id: n.id })}
                      onChange={(e) => patchNote(n.id, { text: e.target.value })}
                      className="block w-full resize-y bg-transparent text-sm leading-snug text-ink placeholder:text-slate/70 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            )
          })}

          {/* Threads. The string is drawn over the notes; the part you click to select it sits under them,
              so it never blocks a pin or a note. */}
          {(['hit', 'string'] as const).map((layer) => (
            <svg
              key={layer}
              className={`pointer-events-none absolute inset-0 ${layer === 'hit' ? 'z-0' : 'z-40'}`}
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              aria-hidden
            >
              {data.threads.map((t) => {
                const from = data.notes.find((n) => n.id === t.from)
                const to = data.notes.find((n) => n.id === t.to)
                if (!from || !to) return null
                const d = threadPath(pinPoint(position(from)), pinPoint(position(to)))
                const isSelected = selected?.type === 'thread' && selected.id === t.id
                return layer === 'hit' ? (
                  <path
                    key={t.id}
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    className="pointer-events-auto cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSelected({ type: 'thread', id: t.id })
                    }}
                  />
                ) : (
                  <g key={t.id}>
                    <path d={d} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={3} transform="translate(1.5 3)" />
                    <path d={d} fill="none" className={isSelected ? 'stroke-mint-500' : 'stroke-thread'} strokeWidth={isSelected ? 4 : 2.5} strokeLinecap="round" />
                  </g>
                )
              })}
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}
