/**
 * Search engines and link previews (Google, Bing, WhatsApp, LinkedIn)
 * ===================================================================
 * The site is a single-page app, so every address starts from the same index.html.
 * This build step writes a copy of index.html for every page with that page's own
 * title, description, canonical address and social-preview tags, plus:
 *   - sitemap.xml listing every page (with "last verified" dates where we have them)
 *   - structured data (JSON-LD) for the organisation and for each university
 *
 * Every page has its own HTML file (served by Vercel's cleanUrls), and 404.html handles
 * unknown addresses, so no catch-all rewrite is needed.
 *
 * It runs automatically during `npm run build`. Nothing to maintain: new scholarships,
 * universities, Rehbars and guides in the data files are picked up on the next build.
 */
import type { Plugin } from 'vite'
import en from '../src/i18n/en'
import { site } from '../src/config/site'
import scholarshipsFile from '../src/data/scholarships.json'
import universitiesFile from '../src/data/universities.json'
import rehbarsFile from '../src/data/rehbars.json'
import { resources } from '../src/content'

interface PageMeta {
  path: string
  title: string
  description: string
  lastmod?: string | null
  jsonLd?: object[]
  /** Leave out of the sitemap (e.g. form-only pages) */
  noSitemap?: boolean
}

type Raw = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const clip = (text: string, max = 158) => (text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text)

function pages(): PageMeta[] {
  const list: PageMeta[] = [
    {
      path: '/',
      title: en.meta.defaultTitle,
      description: en.meta.defaultDescription + ' ' + en.brand.mission,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: site.name,
          url: site.url,
          logo: `${site.url}/favicon.svg`,
          slogan: site.tagline,
          description: en.meta.defaultDescription,
          ...(site.contactEmail ? { email: site.contactEmail } : {}),
          areaServed: 'Pakistan',
          founder: site.founder.name ? { '@type': 'Person', name: site.founder.name, sameAs: site.founder.linkedin || undefined } : undefined,
        },
        { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url },
      ],
    },
    { path: '/rehbars', title: en.rehbars.title, description: en.rehbars.intro },
    { path: '/scholarships', title: en.scholarships.title, description: en.scholarships.intro },
    { path: '/universities', title: en.universities.title, description: en.universities.intro },
    { path: '/students', title: en.students.title, description: en.students.intro },
    { path: '/become-a-rehbar', title: en.become.title, description: en.become.intro },
    { path: '/resources', title: en.resources.title, description: en.resources.intro },
    { path: '/schools', title: en.schools.title, description: en.schools.intro },
    { path: '/about', title: en.about.title, description: en.about.missionText },
    { path: '/contact', title: en.contact.title, description: en.contact.intro },
    { path: '/privacy', title: en.privacy.title, description: en.privacy.intro },
    { path: '/request', title: 'Request a Rehbar', description: en.rehbars.requestNote, noSitemap: true },
  ]

  for (const s of (scholarshipsFile.scholarships ?? []) as Raw[]) {
    const slug = str(s.slug)
    if (!slug || s.openToPakistani !== true) continue
    list.push({
      path: `/scholarships/${slug}`,
      title: str(s.name),
      description: [str(s.provider), str(s.eligibility)].filter(Boolean).join('. '),
      lastmod: str(s.lastVerified) || null,
    })
  }

  for (const u of (universitiesFile.universities ?? []) as Raw[]) {
    const slug = str(u.slug)
    if (!slug) continue
    const name = str(u.name)
    const short = str(u.shortName)
    const aidCount = Array.isArray(u.aid) ? u.aid.length : 0
    list.push({
      path: `/universities/${slug}`,
      title: short && short !== name ? `${short}: fees, hostel and financial aid` : `${name}: fees, hostel and financial aid`,
      description: `${name}, ${str(u.city)}. ${aidCount} financial aid programs explained step by step, and the cost of living at home vs in the hostel.`,
      lastmod: str(u.lastVerified) || null,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollegeOrUniversity',
          name,
          ...(short ? { alternateName: short } : {}),
          url: str(u.website) || undefined,
          address: { '@type': 'PostalAddress', addressLocality: str(u.city), addressRegion: str(u.province) || undefined, addressCountry: 'PK' },
        },
      ],
    })
  }

  for (const r of (rehbarsFile.rehbars ?? []) as Raw[]) {
    const slug = str(r.slug)
    if (!slug || r.sample === true) continue
    list.push({ path: `/rehbars/${slug}`, title: `${str(r.name)}, Rehbar`, description: str(r.story) })
  }

  for (const g of resources) {
    list.push({ path: `/resources/${g.slug}`, title: g.title, description: g.summary })
  }

  return list
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** JSON inside <script> must never contain "</script>". */
const jsonForScript = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')

function pageHtml(template: string, page: PageMeta): string {
  const fullTitle = page.path === '/' ? page.title : `${page.title} · ${site.name}`
  const url = site.url + (page.path === '/' ? '/' : page.path)
  const description = escapeAttr(clip(page.description))
  const title = escapeAttr(fullTitle)
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
  if (page.jsonLd?.length) {
    const scripts = page.jsonLd.map((d) => `<script type="application/ld+json">${jsonForScript(d)}</script>`).join('\n    ')
    html = html.replace('</head>', `    ${scripts}\n  </head>`)
  }
  return html
}

function sitemap(list: PageMeta[]): string {
  const urls = list
    .filter((p) => !p.noSitemap)
    .map((p) => {
      const loc = escapeXml(site.url + (p.path === '/' ? '/' : p.path))
      return `  <url><loc>${loc}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`
    })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by build/seo-plugin.ts on every build. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function seoPages(): Plugin {
  return {
    name: 'myrehbar-seo-pages',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') throw new Error('seo-plugin: index.html not found in the build')
      const template = String(index.source)
      const list = pages()

      for (const page of list) {
        const html = pageHtml(template, page)
        if (page.path === '/') index.source = html
        else this.emitFile({ type: 'asset', fileName: `${page.path.slice(1)}.html`, source: html })
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(list) })
      // Vercel serves 404.html (with a 404 status) for any address that has no page.
      // It loads the same app, which shows the friendly "page not found" screen.
      const notFound = pageHtml(template, { path: '/404', title: en.notFound.title, description: en.notFound.text })
        .replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />')
      this.emitFile({ type: 'asset', fileName: '404.html', source: notFound })
    },
  }
}
