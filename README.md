# MyRehbar

Free mentorship and scholarship awareness for students in Pakistan.
Mentors are called **Rehbars** (رہبر, "guide").

> Students don't fail because they lack money. They rule themselves out because nobody told them funding exists.

This is a **static website**: there is no backend, no database, no login and no paid service.
All content lives in files in this repo, all forms are Google Forms, and it deploys free on Vercel.

---

## 1. Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
```

Other commands:

```bash
npm run build      # type-check, then build to /dist (this is what Vercel runs)
npm run preview    # serve the built /dist locally
npm run lint       # ESLint
```

Notes that only show in `npm run dev` (never on the live site) point to things you still need to set up, for example missing form links or impact numbers.

---

## 2. Where things live

```
src/
  config/
    forms.ts        Google Form links and pre-fill entry ids
    site.ts         Domain, contact email, social links
  data/
    rehbars.json    Mentors (edit this to add a Rehbar)
    scholarships.json
    stats.ts        Impact numbers on the home page
    index.ts        Loads and cleans the JSON so bad entries never crash a page
  content/          The guides on /resources (one file per guide)
  i18n/
    en.ts           All English text on the site
    ur.ts           Urdu text (same keys)
  components/       Reusable UI (Button, Card, Tag, FilterBar, FormEmbed, Logo, …)
  pages/            One file per page
  types.ts          Rehbar, Scholarship and Resource types
tailwind.config.js  Design tokens: every colour, font size and radius
public/             favicon, OG image, robots.txt, sitemap.xml
vercel.json         Makes deep links like /rehbars/sample-rehbar-1 work
design/             Original logo sheet (not used by the build)
```

**Colours:** every colour is a token in `tailwind.config.js`. Change a hex value there and it updates everywhere. Keep the contrast rules in the comment at the top of that file (never use `mint-500` for text on white).

---

## 3. Add or edit a Rehbar

1. Open `src/data/rehbars.json`.
2. Copy an existing entry inside `"rehbars": [ … ]` and change the values.
   - `slug` must be unique and URL-safe, e.g. `"ayesha-khan"`. The profile will be at `/rehbars/ayesha-khan`.
   - `field` must be one of: `engineering`, `medicine`, `business`, `cs`, `arts`, `social-sciences`, `law`, `sciences`.
   - `helpsWith` can include: `choosing-field`, `applications`, `essays`, `interviews`, `english-tests`, `university-life`.
   - `woman: true` makes them show up under **Women Rehbars only**. `scholarshipRecipient: true` does the same for **Scholarship recipients**.
   - `photo` is optional. Put a small image (about 200×200px, under 30 KB) in `public/rehbars/` and set `"photo": "/rehbars/ayesha.jpg"`. Leave it empty to show initials.
   - `featured: true` puts them on the home page (the first 3 are shown).
3. Remove `"sample": true` for real people, and delete the sample entries before launch.
4. **Never add a phone number or email.** This file is public. Students contact Rehbars only through the request form.
5. Get each Rehbar's written permission before publishing their name and story.
6. Commit and push. Vercel redeploys automatically.

If an entry is missing `slug` or `name`, it is skipped (with a warning in the browser console during `npm run dev`) rather than breaking the page.

## 4. Add or edit a scholarship

1. Open `src/data/scholarships.json`. **Verify every entry against the official website before publishing.**
2. Copy an entry and fill it in:
   - `levels`: any of `undergraduate`, `masters`, `phd`, `exchange`.
   - `fundingType`: `full` or `partial`.
   - `deadline`: `"YYYY-MM-DD"` or `null` if you don't know the exact date. It drives the **Nearest deadline** sort, the **Deadline coming up** filter and "x days left".
   - `lastVerified`: the date you checked the official site, `"YYYY-MM-DD"`. It shows on every card.
   - `howToApply`: optional list of steps. If empty, a general checklist is shown.
3. The five included entries are **samples**: the program names are real, but every detail is marked `TODO verify` and must be checked by you. Remove `"sample": true` once an entry is verified.

## 5. Edit the guides (/resources)

Each guide is a file in `src/content/`. Edit the text, then change `draft: true` to `draft: false` to remove the "Draft" badge. To add a guide, copy a file, change its `slug`, and add it to the list in `src/content/index.ts`.

## 6. Impact numbers

Edit `src/data/stats.ts`. Leave a value as `null` to hide it. If every value is `null`, the whole strip is hidden. Only put in real numbers.

---

## 7. Set up the Google Forms

You need four forms. Responses go to a Google Sheet in your Google account.

| Key in `forms.ts`    | Used on                                      | Suggested questions |
|----------------------|----------------------------------------------|---------------------|
| `studentSignup`      | /students, "Get a Rehbar to help you apply"  | Name, age, city, school/college, phone or email of student **or parent**, field of interest, "Which scholarship do you want help with?" (short answer), "Would you prefer a woman Rehbar?", "Does a parent or teacher know you are signing up?" |
| `rehbarApplication`  | /become-a-rehbar                              | Name, email, university, country, field, background, languages, hours per week, agreement to the code of conduct and safeguarding rules |
| `mentorshipRequest`  | "Request this Rehbar" buttons                 | Student name, contact, "Which Rehbar would you like?" (short answer), what they need help with |
| `contact`            | /contact, /schools, About "Partner with us"   | Name, organisation, email, "What is this about?" (short answer), message |

**Steps for each form:**

1. Go to [forms.google.com](https://forms.google.com) and create the form.
2. In **Responses**, click the Sheets icon to link a Google Sheet.
3. Click **Send** → the link icon (🔗) → copy the link. Use the **long** link ending in `/viewform`, not the `forms.gle` short link (pre-fill and embedding only work with the long one).
4. Paste it as `url` in `src/config/forms.ts`.

**Pre-fill entry ids** (so "Request this Rehbar" fills in the Rehbar's name automatically):

1. In the form editor, click **⋮** (top right) → **Get pre-filled link**.
2. Type anything (e.g. `test`) into the question you want to pre-fill, e.g. "Which Rehbar would you like?".
3. Click **Get link** → **Copy link**. It looks like
   `https://docs.google.com/forms/d/e/1FAIpQL…/viewform?usp=pp_url&entry.1234567890=test`
4. Copy the `entry.1234567890` part and paste it into the matching key in `forms.ts`:
   - `mentorshipRequest.prefill.rehbarName`
   - `studentSignup.prefill.scholarship` (optional)
   - `contact.prefill.topic` (optional; the Schools page pre-fills "School program")

Pre-fill keys that are still placeholders are ignored, so the plain form opens instead. Until a form's `url` is filled in, the on-page form box shows "This form is not set up yet".

**Privacy tips:** in each form's settings, turn **off** "Collect email addresses" unless you need it, and don't ask for more than you need. The privacy page (`/privacy`, text in `src/i18n/en.ts` → `privacy`) describes what you collect, so keep it accurate.

---

## 8. Deploy free on Vercel

1. **Push to GitHub.**
   ```bash
   git init
   git add .
   git commit -m "MyRehbar website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/myrehbar.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), sign up with GitHub (the free **Hobby** plan is fine).
3. Click **Add New… → Project**, and **Import** your `myrehbar` repo.
4. Settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** leave as default
5. Click **Deploy**. After about a minute you get a URL like `myrehbar.vercel.app`.
6. From now on, every `git push` to `main` redeploys automatically.

`vercel.json` contains a rewrite so links like `/scholarships/chevening` work when opened directly or refreshed. Real files like `/sitemap.xml` and `/og-image.png` are still served as normal.

### Connect myrehbar.org

1. In Vercel, open the project → **Settings → Domains**.
2. Add `myrehbar.org`, and also `www.myrehbar.org` (choose to redirect `www` to the root domain, or the other way round).
3. Vercel shows the DNS records to add. Log in where you bought the domain and add them in its DNS settings. They usually look like this, but **use the exact values Vercel shows you**:

   | Type  | Name / Host | Value                  |
   |-------|-------------|------------------------|
   | A     | `@`         | `76.76.21.21`          |
   | CNAME | `www`       | `cname.vercel-dns.com` |

   Remove any old A/CNAME records for `@` or `www` that point somewhere else.
4. Wait for DNS to update (minutes to a few hours). Vercel adds free HTTPS automatically.

If you use a different domain, update `src/config/site.ts`, the URLs in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

### Optional: Vercel Web Analytics

No tracking is included. If you want simple, cookie-free visitor counts:
1. In Vercel → project → **Analytics** → enable.
2. `npm install @vercel/analytics`, then in `src/main.tsx` add `import { Analytics } from '@vercel/analytics/react'` and render `<Analytics />` next to `<App />`.
3. To remove it later, delete those two lines and uninstall the package. Update the privacy page if you turn it on.

---

## 9. Urdu translations

- All text is in `src/i18n/en.ts` (English) and `src/i18n/ur.ts` (Urdu). Both files have the same keys, and TypeScript will fail the build if a key is missing in Urdu.
- Short UI strings (menu, buttons, headings, filters) have a first-draft Urdu translation. **Please review them.**
- Longer text is marked `TODO-UR: <English text>`. Until you replace it, the site shows the English version. Search `ur.ts` for `TODO-UR` to see what's left.
- Replace the whole string, including `TODO-UR: `, with your Urdu text.
- Keep `{count}`, `{name}`, `{date}` and `{year}` placeholders as they are. The code fills them in.
- Rehbar profiles, scholarship entries and guides are English-only for now (they come from the data files).
- Switching to Urdu sets `<html lang="ur" dir="rtl">` and loads the Noto Nastaliq Urdu font on demand, so English-only visitors never download it. The only thing the site stores in the browser is this language choice.

---

## 10. Before launch checklist

- [ ] Replace founder story text in `src/i18n/en.ts` → `home.founderTitle` / `home.founderText`
- [ ] Paste all four Google Form URLs and the pre-fill entry ids into `src/config/forms.ts`
- [ ] Replace sample Rehbars with real ones (with permission), or remove them
- [ ] Verify every scholarship, set `lastVerified`, remove `sample`
- [ ] Review and un-draft the guides in `src/content/`
- [ ] Add real impact numbers in `src/data/stats.ts` (or leave them hidden)
- [ ] Contact email and social links in `src/config/site.ts`
- [ ] Review the Urdu strings in `src/i18n/ur.ts`
- [ ] Re-check `/privacy` matches what your forms actually collect

---

## Later (not built yet)

The code is set up so these can be added without a rewrite:

- **A real database** (e.g. Supabase free tier): replace the imports in `src/data/index.ts` with fetch calls. Pages use only `rehbars`, `scholarships`, `getRehbar` and `getScholarship`, so the change stays in one file.
- **Logins and dashboards:** add routes in `src/App.tsx`. The `Layout` already wraps every page.
- **Automatic matching and session booking:** would replace the Google Forms behind `src/config/forms.ts`.
