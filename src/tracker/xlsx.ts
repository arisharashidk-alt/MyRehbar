/**
 * A small .xlsx writer (Excel, Google Sheets, LibreOffice and Numbers all open it).
 *
 * Written here instead of adding a spreadsheet library: it only needs to WRITE plain tables,
 * and this keeps third-party code away from people's tracker data.
 *
 * Every text cell is an "inline string", which Excel never runs as a formula, so a note that
 * starts with "=" stays plain text.
 */
import type { TrackerData } from './model'
import { estimateDeadline } from './plan'
import type { TrackerText } from './text'

type Cell = string | number | boolean | null | undefined
export interface SheetTable {
  name: string
  rows: Cell[][]
}

/* ---------------- Zip (stored, no compression) ---------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(files: { name: string; data: Uint8Array }[]): Blob {
  const enc = new TextEncoder()
  const now = new Date()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = enc.encode(file.name)
    const crc = crc32(file.data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // UTF-8 names
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, time, true)
    local.setUint16(12, date, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, file.data.length, true)
    local.setUint32(22, file.data.length, true)
    local.setUint16(26, name.length, true)
    parts.push(new Uint8Array(local.buffer), name, file.data)

    const entry = new DataView(new ArrayBuffer(46))
    entry.setUint32(0, 0x02014b50, true)
    entry.setUint16(4, 20, true)
    entry.setUint16(6, 20, true)
    entry.setUint16(8, 0x0800, true)
    entry.setUint16(10, 0, true)
    entry.setUint16(12, time, true)
    entry.setUint16(14, date, true)
    entry.setUint32(16, crc, true)
    entry.setUint32(20, file.data.length, true)
    entry.setUint32(24, file.data.length, true)
    entry.setUint16(28, name.length, true)
    entry.setUint32(42, offset, true)
    central.push(new Uint8Array(entry.buffer), name)
    offset += 30 + name.length + file.data.length
  }

  const centralSize = central.reduce((n, p) => n + p.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/* ---------------- Workbook ---------------- */

/** Escape for XML, and drop characters XML does not allow. */
function xml(text: string): string {
  return text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function columnName(index: number): string {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  return name
}

function sheetXml(rows: Cell[][]): string {
  const widths = rows[0]?.map((_, c) => Math.min(60, Math.max(10, ...rows.map((r) => String(r[c] ?? '').split('\n')[0].length + 2)))) ?? []
  const cols = widths.length ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${columnName(c)}${r + 1}`
          const style = r === 0 ? ' s="1"' : ' s="2"'
          if (value === null || value === undefined || value === '') return ''
          if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`
          if (typeof value === 'boolean') return `<c r="${ref}"${style} t="b"><v>${value ? 1 : 0}</v></c>`
          return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xml(String(value).slice(0, 32000))}</t></is></c>`
        })
        .join('')
      return `<row r="${r + 1}">${cells}</row>`
    })
    .join('')
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `${cols}<sheetData>${body}</sheetData></worksheet>`
  )
}

/** Excel sheet names: 31 characters at most, none of : \ / ? * [ ] */
function sheetName(name: string, used: Set<string>): string {
  let base = name.replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 28) || 'Sheet'
  let candidate = base
  for (let i = 2; used.has(candidate.toLowerCase()); i++) candidate = `${base} ${i}`
  used.add(candidate.toLowerCase())
  base = candidate
  return base
}

export function workbook(tables: SheetTable[]): Blob {
  const enc = new TextEncoder()
  const used = new Set<string>()
  const names = tables.map((t) => sheetName(t.name, used))
  const files = [
    {
      name: '[Content_Types].xml',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        tables.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        names.map((n, i) => `<sheet name="${xml(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
        '</sheets></workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        tables.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
        `<Relationship Id="rId${tables.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      // Style 1: bold header. Style 2: wrapped text, aligned to the top.
      name: 'xl/styles.xml',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>' +
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
        '</styleSheet>',
    },
    ...tables.map((t, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, text: sheetXml(t.rows) })),
  ]
  return zip(files.map((f) => ({ name: f.name, data: enc.encode(f.text) })))
}

/* ---------------- The tracker as tables ---------------- */

export function trackerTables(data: TrackerData, t: TrackerText): SheetTable[] {
  const f = t.exportFile
  const yesNo = (v: boolean) => (v ? f.yes : f.no)
  const appName = new Map(data.applications.map((a) => [a.id, a.program ? `${a.name} · ${a.program}` : a.name]))
  const sem = (s: { season: 'fall' | 'spring'; year: number }) => `${t.seasons[s.season]} ${s.year}`

  const applications: Cell[][] = [
    [f.name, f.program, f.kind, f.country, f.semester, f.deadline, f.estimated, f.status, f.starred, f.progress, ...data.columns.map((c) => c.name), f.link, f.extra, f.notes],
    ...data.applications.map((a) => [
      a.name,
      a.program,
      t.kinds[a.kind],
      a.country,
      sem(a.semester),
      a.deadline ?? estimateDeadline(a.semester),
      yesNo(!a.deadline || a.deadlineEstimated),
      t.status[a.status],
      yesNo(a.starred),
      `${a.milestones.filter((m) => m.done).length} / ${a.milestones.length}`,
      ...data.columns.map((c) => {
        const v = a.values[c.id]
        if (typeof v === 'boolean') return yesNo(v)
        if (c.type === 'number' && typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
        return v ?? ''
      }),
      a.url,
      a.extra.map((e) => `${e.label}: ${e.value}`).join('\n'),
      a.notes,
    ]),
  ]

  const steps: Cell[][] = [
    [f.application, f.group, f.step, f.date, f.done],
    ...data.applications.flatMap((a) => a.milestones.map((m) => [appName.get(a.id), t.groups[m.group], m.title, m.due ?? '', yesNo(m.done)])),
  ]

  const tests: Cell[][] = [
    [f.test, f.status, f.prepStart, f.testDate, f.score],
    ...data.tests.map((x) => [x.name, t.tests.statuses[x.status], x.prepStart ?? '', x.testDate ?? '', x.score]),
  ]

  const noteLabel = new Map(data.notes.map((n, i) => [n.id, n.appId ? appName.get(n.appId) ?? `#${i + 1}` : n.text.split('\n')[0].slice(0, 40) || `#${i + 1}`]))
  const notes: Cell[][] = [
    [f.note, f.color, f.pinnedApplication, f.connectedTo, f.hasImage],
    ...data.notes.map((n) => [
      n.text,
      t.noteColors[n.color],
      n.appId ? appName.get(n.appId) ?? '' : '',
      data.threads
        .filter((th) => th.from === n.id || th.to === n.id)
        .map((th) => noteLabel.get(th.from === n.id ? th.to : th.from))
        .join('\n'),
      yesNo(Boolean(n.image)),
    ]),
  ]

  return [
    { name: f.applications, rows: applications },
    { name: f.steps, rows: steps },
    { name: f.tests, rows: tests },
    { name: f.board, rows: notes },
  ]
}

export function downloadTracker(data: TrackerData, t: TrackerText) {
  const blob = workbook(trackerTables(data, t))
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `myrehbar-tracker-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
