/**
 * Cities for the "Where do you live?" filter on Pakistan scholarships.
 * Scholarships in Pakistan depend on your province (domicile), so each city maps to its province.
 * Add a city by adding it to the right list.
 */
export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu and Kashmir',
] as const

export type Province = (typeof PROVINCES)[number]

export const CITIES: Record<Province, string[]> = {
  Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpurkhas', 'Nawabshah'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Dera Ismail Khan', 'Kohat'],
  Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu'],
  'Azad Jammu and Kashmir': ['Muzaffarabad', 'Mirpur'],
}

/** Filter value -> province. Values look like "Karachi" or "other:Sindh". */
export function provinceFor(value: string): Province | null {
  if (value.startsWith('other:')) {
    const p = value.slice(6)
    return (PROVINCES as readonly string[]).includes(p) ? (p as Province) : null
  }
  for (const p of PROVINCES) if (CITIES[p].includes(value)) return p
  return null
}
