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
    tracker.ts      The application tracker link (a second Apps Script URL)
    site.ts         Domain, contact email, social links
  data/
    rehbars.json    Mentors (edit this to add a Rehbar)
    scholarships.json
    universities.json   Universities, costs and financial aid
    universities.ts     Loads universities.json
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
  tracker/          The application tracker: data shape, plan builder, saving, Excel export
    session.ts      The login kept in the browser (token + email only)
    crypto.ts       Turns the password into a key; the password never leaves the browser
    model.ts        The tracker's shape, and checks for everything loaded from the server
    plan.ts         Builds each application's steps and dates; calendar colours
    text.ts         Text for /login and /tracker (English + Urdu)
    components/     Table, calendar, softboard, tests and account views
  components/       Reusable UI (Button, Card, Tag, FilterBar, MyRehbarForm, Logo, …)
  pages/            One file per page
  types.ts          Rehbar, Scholarship and Resource types
tailwind.config.js  Design tokens: every colour, font size and radius
public/             favicon, OG image, robots.txt
build/seo-plugin.ts Per-page titles/descriptions, sitemap.xml, structured data (runs on build)
vercel.json         Deep links (/rehbars/…) + security headers
scripts/
  check.mjs         Link/scholarship checker you run by hand (npm run check)
  watch-pages.json  Official pages watched for new scholarships
google-apps-script/
  Code.gs           Paste into your Google Sheet; saves form answers
  Tracker.gs        A separate Apps Script for tracker logins and saved trackers (section 7a)
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
   - `country`: `"Pakistan"` puts it under the **In Pakistan** tab; any other country puts it under **Abroad**.
   - `levels`: any of `school`, `undergraduate`, `masters`, `phd`, `exchange`.
   - `fundingType`: `full` or `partial`.
   - `deadline`: `"YYYY-MM-DD"` or `null` if you don't know the exact date. It drives the **Nearest deadline** sort, the **Deadline coming up** filter and "x days left".
   - `sources`: the official pages where you checked the details. They show under "Where we checked this".
   - `lastVerified`: set it with `npm run verify -- <slug>` after you've checked the official site (see section 4b).
   - `howToApply`: optional list of steps. If empty, a general checklist is shown.

## 4a. Add or edit a university

Universities live in `src/data/universities.json` and show at `/universities`. Each one has official links, admission steps, financial aid programs (what each covers, who can apply, how to apply), and costs.

- **Only use facts from the university's own website** (or HEC/PMDC), and list those pages in `sources`.
- `costs.tuitionPerYear` / `costs.hostelPerYear` are per **year** in PKR, for the `academicYear` given. Leave them out if the official fee page doesn't say. The site then shows "check the official fee page" instead of a number.
- For each aid program, set `coversHostel` to `true` or `false` only if the official page says so. These power the "Aid can cover hostel" filter.

## 4b. Check that everything is still legit (run it yourself)

The checker runs **only on your computer, only when you run it**. Nothing runs on a server or automatically.

```bash
npm run check
```

It visits every official link in the scholarships, universities and official-list data and tells you:

| Symbol | Meaning | What to do |
|---|---|---|
| ❌ | A link is broken or keeps failing | Find the program's new official page and update the link |
| ⚠️ | A page **changed** since your last run | Re-read it: dates, amounts or rules may have changed |
| ⚠️ | A link now sends you to a **different website** | Make sure it's still the official site (an expired domain can be taken over) |
| ⚠️ | The page no longer mentions the program's name | It may have moved or ended |
| ⚠️ | A deadline in our data has passed | Update it to the next cycle, or set it to `null` |
| ⚠️ | Nobody has checked the entry by hand for 90+ days | Re-read it, then verify (below) |
| ★ | New links appeared on watched pages (e.g. HEC's scholarships page) | Possible new scholarships: check them before adding |
| 📅 | Deadline-like dates it found on the official pages | Compare with our data |

The full report is saved to `reports/check-YYYY-MM-DD.md`. Open it in VS Code and press **Cmd+Shift+V** for a readable view. Reports stay on your computer (they're in `.gitignore`).

Some official sites block automated checks (e.g. PEC). The report marks those as "open it by hand"; that doesn't mean the link is broken.

**After you've checked an entry by hand**, stamp today's date on it:

```bash
npm run verify -- chevening hec-need-based-scholarship
```

Then commit and push, and the site shows the new "Last verified" date.

Options:
- `npm run check -- --only scholarships` (or `universities`, `lists`) checks just one part.
- To watch another listing page for new scholarships, add it to `scripts/watch-pages.json`.

## 4c. Scholarships and universities in your Google Sheet

Your MyRehbar Google Sheet (the one with the form responses) can show the scholarships and universities too, in four extra tabs:

| Tab | What's in it |
|---|---|
| Directory: Scholarships in Pakistan | With the province each one is limited to |
| Directory: Scholarships abroad | |
| Directory: Universities | Fees (home vs hostel), hostel info, official links |
| Directory: University aid | Every aid program at every university, one per row |

**One-time setup** (after you update the script):
1. Open the sheet → **Extensions → Apps Script**, replace everything with the latest [google-apps-script/Code.gs](google-apps-script/Code.gs), and click **Save**. You don't need a new deployment: the form link keeps working as it is.
2. Reload the sheet. A **MyRehbar** menu appears at the top.

**To update the tabs:** click **MyRehbar → Update scholarships & universities**. The first time, Google asks for permission to "connect to an external service"; that's the script reading `myrehbar.org/data/…`. Click **Allow**.

- It copies whatever is **live on the website**, so push your changes first, then click Update.
- It only runs when you click it.
- The four Directory tabs are replaced each time, so don't edit them by hand (Google warns you if you try). To change the data, edit `src/data/*.json` (or ask Claude) and push.
- It never touches the form tabs (Students, Rehbar requests, Rehbar applications, Contact), and it refuses to write to them.

**Offline copy:** `npm run export` saves the same four tables as CSV files in `exports/` (kept on your computer), if you ever need them for another sheet or Excel.

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

## 7a. Application tracker (logins)

Students can create a free account and plan their master's and scholarship applications at **/tracker**: a table with their own columns, a step-by-step plan with dates for each application (SOP, recommendation letters, IELTS/GRE, documents, uni-assist/VPD…), a colour-coded calendar, a softboard with sticky notes and threads, and an Excel download of everything. Logins and trackers are saved in the same private Google Sheet as the forms, in three new tabs.

### How it works

```
Browser (/login, /tracker) ──HTTPS──▶ Tracker Apps Script (a SECOND script) ──▶ same private Google Sheet
                                      Tracker accounts · Tracker sessions · Tracker data
```

- It is a **separate** Apps Script ([google-apps-script/Tracker.gs](google-apps-script/Tracker.gs)) with its own URL. The forms script (`Code.gs`) is unchanged and stays write-only.
- **Passwords never leave the browser.** The site turns the password into a key with PBKDF2-SHA256 (600,000 rounds, [src/tracker/crypto.ts](src/tracker/crypto.ts)). The script stores only an HMAC of that key with a random salt per account and a secret "pepper" kept in Script Properties, not in the sheet. Someone with a copy of the sheet alone cannot test passwords.
- **Login tokens** are random (244 bits). The sheet stores only their SHA-256 hash. They expire after 12 hours, or 30 days with "keep me logged in". A password reset logs out every device; each person can be logged in on at most 10 devices.
- **Email codes** confirm new accounts and password resets: 6 digits, 15 minutes, 5 tries. Errors never reveal whether an email has an account.
- **Limits:** 5 wrong passwords lock that email for 15 minutes; one email per address per minute (5 a day, 80 a day in total); 120 requests a minute overall; 20 saves a minute per person; 1.5 MB per tracker.
- **Saving:** each tracker is one row in "Tracker data", as JSON spread over a few cells. Every save carries a version number, so two tabs or devices never silently overwrite each other: the person is asked which copy to keep. Unsaved changes are kept in the browser until the server confirms them.
- **Safety in the sheet:** nothing the script writes can run as a formula. Logs never contain emails, passwords or tracker data.
- **People control their data:** the Account tab downloads everything as `.xlsx` (made in the browser, no extra library) and deletes the account and tracker (needs the password).

### Set it up (about 10 minutes, once)

1. Go to [script.google.com](https://script.google.com) → **New project**. Name it "MyRehbar tracker". Delete everything in `Code.gs` and paste the whole of [google-apps-script/Tracker.gs](google-apps-script/Tracker.gs). Click **Save**.
2. Copy your sheet's ID: it is the long part of the sheet's address between `/d/` and `/edit`. In the script, open **Project Settings** (⚙️) → **Script Properties** → **Add script property**: name `SHEET_ID`, value the ID. **Save**. (The ID stays in Apps Script. Never put it in this project.)
3. Back in the editor, choose **setupTracker** in the function menu and click **Run**. Allow the permissions it asks for (the sheet, sending email, and a daily clean-up trigger). It creates the three tabs and the secret pepper.
4. **Deploy → New deployment → ⚙️ → Web app**. Description "MyRehbar tracker", **Execute as: Me**, **Who has access: Anyone**. Click **Deploy** and copy the **Web app URL**.
5. Paste it into [src/config/tracker.ts](src/config/tracker.ts):
   ```ts
   export const TRACKER_ENDPOINT = 'https://script.google.com/macros/s/AKfycb…/exec'
   ```
6. Push. Open `/tracker` on the live site, create an account with your own email, and check that the code arrives (look in spam the first time).

Until step 5 is done, `/login` shows "not switched on yet" and nothing is sent anywhere.

After you change `Tracker.gs`, publish a new version: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

### Keeping accounts safe

- **Never change or delete the `TRACKER_PEPPER` script property.** Every password would stop working. Don't copy it anywhere.
- Don't edit the three Tracker tabs by hand (they show a warning if you try). To remove someone, ask them to use **Delete my account**, or delete their rows in all three tabs.
- Only share the Apps Script project with people who already have access to the sheet.
- If you ever think the sheet has leaked: in Script Properties, set `TRACKER_PEPPER` to a new long random value and redeploy. Every login and password stops working, and everyone sets a new password with **Forgot password**.
- A free Google account can send about 100 emails a day. If lots of people sign up at once, codes may stop arriving until the next day.

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

### Visitor numbers (Vercel Web Analytics)

The site counts visits with **Vercel Web Analytics**: no cookies, no personal data. Only the page path is sent; search words and filters (`?q=…`, `?live=…`) are removed first (see `src/main.tsx`).

**Turn it on once:** Vercel → your project → **Analytics** tab → **Enable**. Data appears after the next deploy, within a few minutes of the first visits. You'll see visitors, top pages, countries, devices and where visitors came from (Google, WhatsApp, LinkedIn…).

The free Hobby plan includes Web Analytics with a monthly event limit; check the current limit on Vercel's pricing page. If you outgrow it, upgrade with the rest of the Vercel plan.

**To remove it:** delete the `<Analytics />` component and its import in `src/main.tsx`, run `npm uninstall @vercel/analytics`, and update the privacy text (`privacy.sections` in `src/i18n/en.ts`).

### Showing up in Google and Bing

Every build automatically creates:
- **A page for every address** (each scholarship, university, Rehbar and guide) with its own title, description and canonical link, so Google results and WhatsApp/LinkedIn previews show the right text (`build/seo-plugin.ts`).
- **`sitemap.xml`** listing every page, rebuilt each time you add data.
- **Structured data** describing MyRehbar and each university, which helps Google understand the pages.

**One-time setup** (you):
1. **Google Search Console** (search.google.com/search-console) → **Add property** → **Domain** → `myrehbar.org`. Google gives you a **TXT record**. In Namecheap → **Advanced DNS** → **Add New Record** → **TXT Record**, Host `@`, Value = the text Google gave you → ✓. Back in Search Console, click **Verify** (it can take up to an hour).
2. In Search Console → **Sitemaps** → enter `sitemap.xml` → **Submit**.
3. **Bing Webmaster Tools** (bing.com/webmasters) → **Import from Google Search Console**. This also covers DuckDuckGo and Yahoo.

Search Console then shows which searches find you, how often you appear, and how many people click. New sites usually start appearing within a few days to a few weeks.

**What helps you rank:** links from other sites (school, NGO, university society pages, your LinkedIn and social profiles), sharing pages on WhatsApp and social media, and keeping the information accurate and current.

---

## 9. Urdu translations

- All text is in `src/i18n/en.ts` (English) and `src/i18n/ur.ts` (Urdu). Both files have the same keys, and TypeScript will fail the build if a key is missing in Urdu.
- Short UI strings (menu, buttons, headings, filters) have a first-draft Urdu translation. **Please review them.**
- Longer text is marked `TODO-UR: <English text>`. Until you replace it, the site shows the English version. Search `ur.ts` for `TODO-UR` to see what's left.
- Replace the whole string, including `TODO-UR: `, with your Urdu text.
- Keep `{count}`, `{name}`, `{date}` and `{year}` placeholders as they are. The code fills them in.
- Rehbar profiles, scholarship entries and guides are English-only for now (they come from the data files).
- Switching to Urdu sets `<html lang="ur" dir="rtl">` and loads the Noto Nastaliq Urdu font on demand, so English-only visitors never download it. Apart from this language choice, the site only stores something in the browser for people who log in to the application tracker (their login, and changes not yet saved).

---

## 10. Before launch checklist

- [ ] Set up the Google Sheet + Apps Script and paste the URL into `src/config/forms.ts` (section 7)
- [ ] Replace sample Rehbars with real ones (with permission), or remove them
- [ ] Run `npm run check`, fix anything marked ❌, and verify entries by hand (`npm run verify -- <slug>`)
- [ ] Review and un-draft the guides in `src/content/`
- [ ] Add real impact numbers in `src/data/stats.ts` (or leave them hidden)
- [ ] Contact email and social links in `src/config/site.ts`
- [ ] Review the Urdu strings in `src/i18n/ur.ts`
- [ ] Set up the tracker Apps Script and paste its URL into `src/config/tracker.ts` (section 7a), then create a test account
- [ ] Review the tracker's Urdu text in `src/tracker/text.ts`
- [ ] Re-check `/privacy` matches what your forms and the tracker actually collect

---

## Later (not built yet)

The code is set up so these can be added without a rewrite:

- **A real database** (e.g. Supabase free tier): replace the imports in `src/data/index.ts` with fetch calls. Pages use only `rehbars`, `scholarships`, `getRehbar` and `getScholarship`, so the change stays in one file.
- **Moving the tracker off Google Sheets** (if it outgrows a free Google account): only `src/tracker/api.ts` talks to the server, so a real database can replace `Tracker.gs` without touching the pages.
- **Automatic matching and session booking:** `src/forms/submit.ts` is the only place answers are sent, so it can point at a real backend later.
