# MyRehbar

Free mentorship and scholarship awareness for students in Pakistan.
Mentors are called **Rehbars** (رہبر, "guide").

> Students don't fail because they lack money. They rule themselves out because nobody told them funding exists.

This is a **static website**: there is no backend, no database, no login and no paid service.
All content lives in files in this repo, form answers go to a private Google Sheet (through a small free Google Apps Script), and it deploys free on Vercel.

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

Notes that only show in `npm run dev` (never on the live site) point to things you still need to set up, for example the form link or impact numbers.

---

## 2. Where things live

```
src/
  config/
    forms.ts        The one form link (your Apps Script URL)
    site.ts         Domain, contact email, social links
  data/
    rehbars.json    Mentors (edit this to add a Rehbar)
    scholarships.json
    stats.ts        Impact numbers on the home page
    index.ts        Loads and cleans the JSON so bad entries never crash a page
  content/          The guides on /resources (one file per guide)
  forms/
    schema.ts       The questions in each form
    validate.ts     Checks answers before sending
    submit.ts       Sends answers to the Apps Script
  i18n/
    en.ts           All English text on the site
    ur.ts           Urdu text (same keys)
  components/       Reusable UI (Button, Card, Tag, FilterBar, MyRehbarForm, Logo, …)
  pages/            One file per page
  types.ts          Rehbar, Scholarship and Resource types
tailwind.config.js  Design tokens: every colour, font size and radius
public/             favicon, OG image, robots.txt, sitemap.xml
vercel.json         Deep links (/rehbars/…) + security headers
google-apps-script/
  Code.gs           Paste into your Google Sheet; saves form answers
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

## 7. Forms

The site has four MyRehbar-styled forms. All answers go to **one private Google Sheet**, with one tab per form:

| Form | Page | Sheet tab |
|---|---|---|
| Student sign-up | `/students` (and "Get a Rehbar to help you apply" on scholarship pages) | Students |
| Request a Rehbar | `/request?rehbar=…` ("Request this Rehbar" buttons) | Rehbar requests |
| Become a Rehbar | `/become-a-rehbar` | Rehbar applications |
| Contact / partner | `/contact` (and "Bring MyRehbar to your school") | Contact |

### How it works

```
Browser ──HTTPS──▶ Google Apps Script (your account) ──▶ private Google Sheet
```

- The website sends answers to a small script that runs in **your** Google account ([google-apps-script/Code.gs](google-apps-script/Code.gs)).
- The script can **only add rows**. It has no way to read the sheet back, so the script link is safe to have in the website code. It is not a password.
- The sheet stays private (sharing: **Restricted**). Only people you share it with can open it.
- Nothing is saved in the visitor's browser. Answers are cleared from the page as soon as they are sent.
- Spam protection: a hidden trap field for bots, a minimum time to fill in the form, and a limit of 30 answers per minute.
- Security: answers can't run as spreadsheet formulas, unknown questions are ignored, and every answer has a length limit. The site also sends strict security headers (see `vercel.json`).

### Set it up (about 10 minutes, once)

1. **Create the sheet.** Go to [sheets.google.com](https://sheets.google.com), create a blank spreadsheet and name it, e.g., "MyRehbar responses". Leave sharing as **Restricted**.
2. **Add the script.** In the sheet, click **Extensions → Apps Script**. Delete everything in `Code.gs`, paste in the whole of [google-apps-script/Code.gs](google-apps-script/Code.gs), then click **Save** (💾).
3. **Create the tabs.** In the toolbar's function menu, choose **`setup`** and click **Run**. Google will ask for permission:
   - Choose your account → **Advanced** → **Go to (project name)** → **Allow**.
   - "Unverified app" is normal: it's your own script, and only you are using it.
   - Back in the sheet you'll now see four tabs with headers.
4. **Publish it.** Click **Deploy → New deployment** → the gear icon → **Web app**, and set:
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*

   Click **Deploy**. "Anyone" lets visitors *submit* without a Google account. It does **not** let them see the sheet.
5. **Copy the Web app URL.** It looks like `https://script.google.com/macros/s/AKfycb…/exec`.
6. **Paste it** into [src/config/forms.ts](src/config/forms.ts):
   ```ts
   export const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycb…/exec'
   ```
7. Run `npm run dev`, submit a test answer on `/contact`, and check that a new row appears in the **Contact** tab. Then commit and push.

**Get notified of new answers:** in the sheet, use **Tools → Notification settings → Edit notifications** and choose "Any changes are made". You'll get an email saying the sheet changed, without the answers in it.

### Changing the questions

The questions are listed in two places that must match:

1. [src/forms/schema.ts](src/forms/schema.ts): the website side (type, required, order).
2. The `FORMS` list in [google-apps-script/Code.gs](google-apps-script/Code.gs): the sheet side (column headers).

Question text goes in `src/i18n/en.ts` → `formFields` and `formOptions` (plus `ur.ts`). After you edit `Code.gs` in Apps Script, publish a new version: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

If you add a column to an existing tab, add the header in the sheet by hand too, or delete the tab and run `setup` again (only on an empty tab!).

### Keeping the data safe

- Turn on **2-Step Verification** on the Google account that owns the sheet.
- Never share the sheet with "Anyone with the link", and never paste the sheet's link into this project.
- Share it only with team members who need it, and remove people who leave.
- Delete answers you no longer need. If someone asks you to delete their data, delete their row.
- If you think the script URL is being abused (lots of spam), create a **new deployment** in Apps Script, paste the new URL into `forms.ts`, and archive the old deployment.

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

- [ ] Set up the Google Sheet + Apps Script and paste the URL into `src/config/forms.ts` (section 7)
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
- **Automatic matching and session booking:** `src/forms/submit.ts` is the only place answers are sent, so it can point at a real backend later.
