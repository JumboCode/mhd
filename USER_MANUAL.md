# Massachusetts History Day — User Manual

This guide covers the MHD participation dashboard end to end: how to use it
day-to-day (what each page does, what every button and symbol means, and
what to expect when you click something), and how to set it up — sending
sign-in emails through Resend and deploying/hosting the application on
Vercel.

Sections 1–10 are written for the people who run the site day-to-day —
Paula, Elyssa, and anyone else at MHS with an administrator account. Sections
11–12 are written for whoever handles the technical setup — an IT contact
comfortable with web accounts and DNS, even if they haven't used Vercel,
Neon, or Resend specifically before.

The site only has one type of user: an **administrator**. There is no
public-facing version — everything described in Sections 1–10 requires
signing in.

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Symbols & Icons You'll See Everywhere](#2-symbols--icons-youll-see-everywhere)
3. [Dashboard (Home Page)](#3-dashboard-home-page)
4. [Chart Page](#4-chart-page)
5. [Map Page](#5-map-page)
6. [Schools Table Page](#6-schools-table-page)
7. [School Profile Page](#7-school-profile-page)
8. [Uploading Data](#8-uploading-data)
9. [Settings Page](#9-settings-page)
10. [Frequently Asked Questions](#10-frequently-asked-questions)
11. [Setting Up Resend (Sign-In Emails)](#11-setting-up-resend-sign-in-emails)
12. [Deploying the Application](#12-deploying-the-application)
13. [Getting More Help](#13-getting-more-help)

---

## 1. Getting Started

### Signing in

There is no password. Instead:

1. Go to the site's sign-in page. You'll see: _"This site is for
   administrators only. Enter your email and we'll send you a one-time code
   to sign in."_
2. Type your email address and click **Sign in**.
3. Check your inbox for a 6-digit code and enter it on the next screen, then
   click **Verify**.
4. If the code doesn't arrive, check your spam/junk folder before clicking
   **Resend Code**. If you typed the wrong email, click **Change Email** to
   start over.

Codes expire after a short time — if yours stops working, just click **Resend
Code** to get a fresh one.

**If you don't have access yet:** clicking **Sign in** shows a red banner
reading _"This email is not authorized to access this application."_ — you
won't receive a code. An existing administrator needs to sign in, go to
**Settings**, and add your email address to the list of authorized users
before you can sign in — see [Authorized Users](#authorized-users) under
Settings.

### The sidebar

The left-hand sidebar is how you get everywhere in the app. It's grouped into
three sections:

| Section  | Page        | Icon                             |
| -------- | ----------- | -------------------------------- |
| ANALYSIS | Map         | a map/pin icon                   |
| ANALYSIS | Chart       | a bar-chart icon                 |
| OVERVIEW | Dashboard   | a layout/grid icon               |
| OVERVIEW | Schools     | a school/building icon           |
| DATA     | Upload Data | an upward arrow into a tray icon |
| DATA     | Settings    | a gear icon                      |

At the bottom of the sidebar:

- **Help** (speech-bubble-with-question-mark icon) — opens a slide-out panel
  on the right that explains whatever page you're currently looking at. It's
  a quick in-app reference; this manual goes into more depth.
- Your **email address**, with a **⋯** (three-dot) button next to it — click
  it to **Sign Out**.

Click the **MHD logo** at the top of the sidebar at any time to return to the
Dashboard.

### Unsaved changes

On a few pages (School Profile, Settings), edits are staged locally before
you save them. If you try to navigate away while something is unsaved, the
app will interrupt you with a dialog asking whether to **Save**, **Discard
Changes**, or **Cancel** and stay on the page. Don't ignore this dialog — if
you discard, your edits are gone.

---

## 2. Symbols & Icons You'll See Everywhere

These same visual cues repeat across almost every page. Learn them once and
the rest of the app becomes much easier to read.

### Trend indicators

Most statistics that can change year to year (student counts, project counts,
teacher counts, school counts) show a small icon next to the percentage
change:

| Icon                     | Meaning                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Green **▲** upward arrow | The number went up compared to the previous year                                                                   |
| Red **▼** downward arrow | The number went down compared to the previous year                                                                 |
| Gray **—** dash          | No change, or there's no prior-year data to compare against (e.g. you're looking at the very first year on record) |

Note: "previous year" means the year immediately before the one you're
viewing, not the most recent year with data. If that specific prior year is
missing/has no data, the trend shows gray — even if an earlier year has data.

### Data-availability colored dots

- In the **Upload Data** flow, a colored dot appears next to the year field:
  a **filled green dot** means that year already has data in the system
  (continuing will overwrite it); a **filled red dot** means no data exists
  yet for that year (uploading will not overwrite anything).
- On the **Dashboard**, **Map**, and **Schools** year dropdowns, every year in
  the list shows a **filled green dot**, since that list only ever contains
  years that already have data.
- On the **School Profile** page's year dropdown, a **filled green dot** means
  the school participated that year; an **outlined green dot** means the year
  has data but this particular school did not participate. Non-participating
  years are also grayed out and can't be selected — the app skips over them
  automatically if you use the arrow keys.

### The cart

Charts and heatmaps you want to save for later or export together live in a
**cart**, similar to an online shopping cart:

- A basket icon with a small number badge in the top corner shows how many
  items are currently in your cart. It only appears once you've added
  something.
- **Add to cart** (a plus-in-a-circle icon) stages the current chart or map.
  Once it's added, the same button turns into **Remove** (a checkmark-in-a-
  circle icon) so you can take it back out.
- Clicking the basket icon opens the **Cart** panel. Hovering over any item
  in the cart shows a small preview of what it looks like. Each item can be
  removed individually with a trash-can icon, or you can **Clear All**.
- **Download** at the bottom of the cart exports everything in it as one
  combined PDF.

★ **Tip:** different forms of exportable figures (e.g. bar chart, line
chart, heatmap) may be downloaded together in a single PDF export — the cart
can hold an assortment of these at once for ease of export.

### Export, copy link, and filters

- **Export** (an outward-arrow "share" icon) always opens a confirmation
  dialog first — e.g. _"Export graph to PDF?"_ — before downloading. Nothing
  downloads on the first click.
- **Copy link** (a chain-link icon) copies a URL that reproduces your exact
  current view — same year, filters, chart type, etc. — so you can paste it
  to a colleague. The icon briefly turns into a checkmark to confirm it
  copied. Note: users must be signed in to access this link.
- **Filters** (a funnel-with-lines icon) opens a panel or popover for
  narrowing down what data is shown. Applied filters usually appear as small
  removable "chips" you can click an **✕** on to remove individually.
- A **⋮** (vertical three dots) button opens a menu of less-common actions
  for whatever it's attached to (a school, a row, etc.).

### On narrow / smaller windows

On a narrower browser window, the row of separate toolbar buttons (Export,
Copy Link, Add to Cart, Cart) collapses into a single **Share** button that
opens the same options as a stacked list. If your toolbar looks different
from what a screenshot shows, this is why — try widening the window.

This app also requires a minimum screen width to function. Most, if not
all, laptops meet this minimum. If your screen size is not supported or
your window is too narrow, you'll see a message reading _"We're sorry,
screens of this size are unsupported."_

---

## 3. Dashboard (Home Page)

The Dashboard is the landing page and gives a one-glance summary of the
program for a single year.

- **Year selector**, top right: click the year to open a dropdown, or use the
  **‹** / **›** arrows on either side to step to the previous/next year with
  data.
- **Five stat cards** across the top, each with its own icon and color:

    | Card                             | Icon                 | Color  |
    | -------------------------------- | -------------------- | ------ |
    | Total # Projects                 | folder icon          | Blue   |
    | Total # Teachers                 | person icon          | Green  |
    | Total # Competing (students)     | graduation cap icon  | Pink   |
    | Total # Participating (students) | graduation cap icon  | Purple |
    | # Schools                        | school/building icon | Orange |

    This same color scheme is used universally throughout the app, from stat
    cards to bar and line charts.

    _Competing_ and _Participating_ are two different, deliberately separate
    counts of students — competing students are those whose projects entered
    the contest; participating students is the broader count MHD uses for
    reach and funding reporting. Each card shows the year-over-year trend
    arrow described in [Section 2](#trend-indicators), and a faint background
    line showing the 6-year trend at a glance.

- **Click any stat card** to jump straight to the Chart page, pre-filtered to
  that exact metric.
- Below the cards, two **line graphs** show Total Projects and Total Schools
  over the past 6 years. Like the stat cards, **clicking either graph** also
  jumps to the full Chart page with that metric already selected.
- If you're viewing the very first year of data on record, a yellow banner
  appears: _"This is the earliest year of available data — year-over-year
  comparisons are not available."_ You can dismiss it with the **✕**; it
  reappears if you switch years again.
- While data is loading you'll see placeholder skeleton boxes. If loading
  fails, a **Try Again** button appears — click it to retry the request.

---

## 4. Chart Page

This is the most powerful page in the app: build a custom bar or line chart
from the underlying participation data, filtered and grouped however you
need for a specific report or question.

### Basics

- **Bar / Line tabs** at the top switch chart type. Each tab shows a small
  keyboard hint (**B** or **L**) — with the chart focused, pressing those
  letter keys switches types without touching the mouse.
- **Date range**, top right: quick buttons for the **3-year** or **5-year**
  window ending at the most recent data, or click the calendar-icon button to
  open a **Select Year Range** popover with **Start Year** / **End Year**
  boxes. The **Apply** button stays disabled if you enter an invalid range
  (start after end, or a year outside 1900–2100).

### Filters

Click **Add filter** (a dashed **+** button) to add one of nine filter
categories: **School, City, Project Type, Division, School Type, Region,
Implementation Type, Teacher Participation, Gateway School.**

- Most filters are **multi-select checklists** — check as many values as you
  want. Each has **Select All**, **Deselect All**, **Clear All**, **Cancel**,
  and **Apply** buttons. The School filter also has a one-click **Gateway
  Schools** shortcut to select every gateway-city school at once (hidden if
  no schools are flagged as Gateway Schools in Settings).
- **Teacher Participation** works differently: pick a comparison (**=**,
  **<**, **>**, or **between**) and enter one or two numbers of years.
- **Gateway School** is a simple on/off toggle.
- Once applied, each active filter shows as a labeled chip (e.g. _"School
  (3): Example High, ..."_) so you can see everything that's currently
  narrowing your data at a glance.
- You can have several different filter categories active at the same time
  (e.g. School Type _and_ Region together) — just not two filters of the
  _same_ category.

### Measuring and grouping

- **Measured as** controls what the chart's vertical axis counts. Options:
  Total School Count, Total Competing Students, Total Participating
  Students, Total City Count, Total Project Count, Total Teacher Count, and
  School Return Rate.
- **Group by** combines results into categories instead of one overall line
  or bar. Options: None, Region, School Type, Division (Junior/Senior),
  Implementation Model, Project Type, Gateway School.
- Not every Measured-as / Group-by combination makes sense together (for
  example, measuring School Count grouped by Project Type). If you pick an
  incompatible combination, the chart area may simply show **"No Data
  Found"** — that's expected, not a bug; adjust your selections.

### Reading the chart

- Below the chart, a **data table** lists the same numbers year by year, with
  a Δ (change) and % Change column using the same trend-arrow colors as
  everywhere else.
- Underneath that, small text shows the total number of data rows and the
  date the underlying data was last updated.

### Data Lineage: where the numbers come from

Every chart is built from your uploaded spreadsheets after passing through
whatever filters and grouping you've applied — which means the number on
screen is rarely the "raw" number. **Data Lineage** exists so you never have
to take that number on faith: it shows the exact trail from spreadsheet cell
to on-screen figure, step by step, in plain English. Use it whenever you
need to double-check a number before it goes into a report, or explain to a
funder or board member exactly what a statistic does and doesn't include.

**To open it:** click **"Where does this data come from?"** in the bottom
right of the Chart page, or press **?**. A window titled **"Data Lineage:
[Metric Name]"** opens, with a one-line description of what the currently
selected metric counts.

Inside, you'll see two sections, color-coded and connected by a timeline:

- **DATA ORIGIN** (blue) — traces the metric back to its source: which
  column in your uploaded spreadsheet it comes from, which database table
  it's stored in, and finally the calculation used to total it up per year —
  written out almost like the actual database query, e.g. _"COUNT(DISTINCT
  schoolId) per year"_ for Total Schools, or _"SUM(numStudents) per year"_
  for a student count. Click this final step to expand a **year-by-year
  table** showing the **unfiltered** value for every year in your selected
  range — this is the true, ground-truth count before any of your filters
  are applied.
- **ACTIVE FILTERS & GROUPING** (orange) — only appears if you currently
  have filters and/or a Group By applied. Each active filter gets its own
  row, in the order it's applied, describing exactly what it restricts (e.g.
  _"Limited to schools in 2 selected cities: Boston, Worcester."_). Click any
  filter to expand a year-by-year table with three columns: **Initial** (the
  value coming into this filter, i.e. after every filter listed above it),
  **Filtered** (the value after this filter is applied), and **Δ** (the
  numeric change this specific filter caused that year — colored red for a
  decrease, green for an increase). This lets you see each filter's effect
  in isolation, layered on top of the previous one, rather than just the
  final combined result. If a Group By is active, a final line explains how
  the data is being split into separate series (e.g. by region or project
  type).

A couple of details worth knowing while reading the tables:

- A year showing **"n.d."** means there's no uploaded data for that year at
  all — different from a real **0**, which means the year has data but
  nothing matched at that point in the filter chain.
- Data Lineage always reflects your **current** chart configuration — if you
  change the Measured As metric, add or remove a filter, change Group By, or
  adjust the year range while this window is open (or before reopening it),
  the entire breakdown rebuilds itself to match. There's nothing to refresh
  manually.

### Saving and sharing your chart

- **Export** downloads the current chart as a PDF (after a confirm dialog).
- **Copy link** copies a URL that reproduces this exact chart configuration.
- **Add to cart** stages the chart for a combined, multi-chart PDF export
  later (see [Section 2](#the-cart)).

### Keyboard shortcuts (optional, not required)

| Key         | Action                                                  |
| ----------- | ------------------------------------------------------- |
| B           | Switch to bar chart                                     |
| L           | Switch to line chart                                    |
| ⌘S / Ctrl+S | Open the export confirmation dialog                     |
| ⌘P / Ctrl+P | Download the PDF immediately, skipping the confirmation |
| ?           | Open "Where does this data come from?"                  |

These shortcuts only work when you aren't actively typing in a text box.

---

## 5. Map Page

An interactive map of Massachusetts showing where MHD schools are and how
much participation is happening in each area.

- **Click-and-drag** to pan around the map; **scroll** (or pinch, on a
  trackpad) to zoom in and out; **right-click and drag up-and-down** to tilt
  into a 3D view.
- **Counts** dropdown: choose what the color-intensity ("heat") represents —
  **Competing Students**, **Participating Students**, **Projects**, or
  **Teachers**.
- **Year** dropdown, with **‹** / **›** arrows to step between years.
- **Region View** dropdown: zoom the map to a preset view — **Default**
  (all of Massachusetts), **Western**, **Central**, **Boston**,
  **Northeast**, or **Southeast**.
- **Filters** button opens a small panel with four toggles: **Show Schools**
  (the dot markers), **Show Heatmap** (the color overlay), **Show Regions**
  (the boundary outlines), and — below a divider — **Gateway Schools Only**,
  which restricts everything on the map to gateway-city schools.
- A **color legend** in the bottom-left of the map (visible whenever the
  heatmap layer is on) shows the gradient from pale yellow (**Low**) through
  orange to dark red (**High**), so you can read participation intensity at
  a glance.
- **Hovering** over a school marker (a dark dot) shows a small popup with
  that school's name and count for the selected metric. **Clicking** a
  marker "pins" that popup open so it won't disappear when you move your
  mouse — click elsewhere on the map, or press **Escape**, to dismiss it.
  Inside the popup, **View Profile →** takes you to that school's full
  profile page.
- **Export**, **Copy link**, and **Add to cart / Cart** work exactly as
  described in [Section 2](#export-copy-link-and-filters) and
  [the cart](#the-cart).

**Keyboard shortcuts:** **‹**/**›** arrow keys switch years; **⌘S/Ctrl+S**
opens the export dialog; **⌘P/Ctrl+P** downloads the PDF immediately.

---

## 6. Schools Table Page

A spreadsheet-style table of every participating school for a chosen year.

- **Year** dropdown with **‹**/**›** arrows, same as other pages.
- **Search bar**: type a school name, city, region, division, school type, or
  implementation model — the search checks all of these at once. Click the
  **✕** in the box to clear it.
- **Filters** button lets you narrow the table by **City, Region, Division,
  School Type,** or **Implementation Model**. Each category shows a
  searchable checklist with **Select All / Deselect All**, **Clear**,
  **Cancel**, and **Apply**. Active filters appear as removable chips below
  the header, along with a **Clear all** option.
- The header line under the page title (e.g. _"42 of 103 schools · 2025"_)
  tells you how many schools match your current search/filters out of the
  total for that year.
- **Columns**: Name, City, Region, Division, Implementation Model, School
  Type, # Competing, # Participating, # Teachers, # Projects.
- **Sorting**: click a column header to sort ascending, click again for
  descending, and a third click returns it to the original (unsorted) order.
- **Resizing**: drag the right edge of a column header to make it wider or
  narrower.
- **Click a school's name** to open its full profile page.
- The **# Competing**, **# Participating**, **# Teachers**, and **# Projects**
  columns show the green up-arrow / red down-arrow / gray dash trend
  indicator described in [Section 2](#trend-indicators), comparing against
  the prior year. Click the number itself in any of those four columns to
  jump straight to the Chart page, pre-filtered to that school and metric.
- If the earliest year of data is selected, the same "no prior-year
  comparison available" banner from the Dashboard appears here too.
- A school only appears in a given year's table if it actually had at least
  one student, teacher, or project recorded that year — schools with zero
  activity for the selected year are left out of that year's list (they'll
  still show up under other years where they did participate).

---

## 7. School Profile Page

Everything about a single school — reached by clicking its name from the
Schools table or a map marker popup.

### Overview

- **Year selector** at the top right — years the school didn't participate
  in are grayed out and unselectable; the ‹/› arrows skip past them
  automatically.
- **Four stat cards** — Total # Projects, Total # Teachers, Total #
  Competing, Total # Participating — each clickable (jumps to the Chart page
  pre-filtered to this school and that metric) and each showing the usual
  trend arrow.
- If it's the school's earliest year on record, a dismissible banner explains
  that year-over-year comparison isn't available yet.

### Trends and breakdown

- A tabbed line graph lets you switch between **Competing**, **Participating**,
  **Teachers**, and **Projects** to see the school's history for each metric
  over the past several years. Click the graph to open it in the full Chart
  page.
- A **pie chart** breaks down that year's projects by category (documentary,
  exhibit, paper, performance, website, etc.), alongside a **Team Projects**
  card showing what percentage of projects were team efforts. This section
  is hidden entirely for a year with no recorded projects.
- An info row shows **Town, Region, Data Since** (first year on record),
  **Implementation Model**, and **Division**.

### Editing the school's location

Under **School Location**, the map shows the school's current pin (blue). To
correct it:

1. Scroll to zoom in and out over the map, and drag to reposition the view.
   Click anywhere on the map to drop a **new, red pin** at that spot and
   show the proposed coordinates — nothing is saved yet.
2. If you click outside Massachusetts, you'll get an error: _"A school's
   location must fall within Massachusetts."_ — try again.
3. **Save** and **Cancel** buttons appear once a new pin is placed. Save
   commits the new coordinates (and automatically recalculates which contest
   region the school belongs in); Cancel discards the proposed pin.
    - Note: the pin itself updates immediately, but if the school's contest
      region also changes, you may need to reload the page to see the new
      region reflected elsewhere on this page.

### Editing project records

The **Project Data** table lists every project recorded for the school in
the selected year. **Double-click any cell to edit it:**

- **Title** — free text.
- **Category** — pick from a dropdown of the official project categories.
- **Team?** — Yes/No.
- **# Students** — must be a positive whole number; the app will warn you
  and revert the field if you enter something invalid.
- **Teacher** and **Teacher Email** — editing either of these updates that
  teacher's information **everywhere** in the system, not just this one
  project, since teachers are shared records across all their projects.

Edited rows are highlighted until you save. A bar at the bottom of the table
reads _"You have unsaved changes"_ with **Discard Changes** and **Save**
buttons — nothing is committed to the database until you click **Save**.

### The ⋮ menu

Click the **⋮** button near the school's name for four actions:

- **Rename school** — opens a dialog to change the display name. The old
  name is saved as a historic alias, so old bookmarks/links using the
  school's former name in the URL still work — they auto-redirect to the
  new name.
- **Change town** — opens a dialog to change the school's town. This is
  just saved as text — it's shown on the profile page and used as a town
  filter on the Chart page — and does **not** change the school's map
  location. Town and location are stored independently.
- **Export to PDF** — downloads a PDF summary of this profile (confirmation
  dialog first, same as other exports). Also available via **⌘S/Ctrl+S**.
- **Merge school** — described next, since it's permanent.

### Merging schools

Use this when the same school appears twice under different names or slight
misspellings, and you want to combine their histories into one record.

1. Click **⋮ → Merge school**. A dialog titled **Merge Schools** appears
   with the current school on one side and a search box to pick the _other_
   school on the other side.
2. An arrow between the two boxes shows which school will survive the merge
   — the box that will be **removed** is tinted red, the one that
   **survives** is tinted green. Click the arrow to flip the direction if
   you picked it backwards.
3. Once you've selected the other school, a warning appears: _"All data from
   [school] will be moved into [school]."_ and _"[school] will be permanently
   removed. This cannot be undone."_
4. You must check **"I understand this is permanent and cannot be undone"**
   before the **Merge** button becomes clickable.

**This action cannot be reversed from within the app**, so double-check the
direction of the arrow before confirming. If someone later visits an old
link or bookmark for the school that got removed, the app automatically
redirects them to the surviving school's profile — old links won't break.

---

## 8. Uploading Data

Use this each time you have a new year of contest data to add, or to correct
data you've already uploaded. The flow is shown as four tabs — **Student**,
**School**, **Location**, **Confirm** — though Student and School each
involve an upload step followed by a review step internally.

**Two things to keep in mind before you start:**

- **Don't refresh or close the tab partway through.** The wizard only keeps
  your progress in memory for that browser tab — refreshing at any point
  before you click **Finish Upload** on the final step discards everything
  you've entered and puts you back at Step 1.
- **Only have one person upload a given year at a time.** The app doesn't
  guard against two people uploading the same year at once — if that
  happens, the two uploads can interfere with each other and leave that
  year's data in an inconsistent state. If you're working with a team,
  agree on who's running the upload before you start.

### Required spreadsheet columns

The templates you download in Steps 1 and 3 already have the right column
headers set up — the tables below are here as a backup reference in case you
ever lose access to a template and need to rebuild one from scratch, or want
to know why a file was rejected. Column headers must match **exactly** as
written (matching ignores capitalization and leading/trailing spaces, but
nothing else — extra words or different punctuation will cause a mismatch), and every
required column must be present with a value in every row unless noted
otherwise. Column order doesn't matter, and extra columns beyond these are
simply ignored.

**Student spreadsheet** — one row per project:

| Column header  | Required value    |
| -------------- | ----------------- |
| `schoolName`   | Text              |
| `city`         | Text              |
| `schoolId`     | A number          |
| `teacherName`  | Text              |
| `teacherEmail` | Text              |
| `teacherId`    | Text or a number  |
| `projectIntId` | A number          |
| `title`        | Text              |
| `categoryId`   | A number          |
| `categoryName` | Text              |
| `teamProject`  | `TRUE` or `FALSE` |

**School spreadsheet** — one row per school:

| Column header                                      | Required value                                                                                                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `School name`                                      | Text                                                                                                                                                        |
| `School id`                                        | A number                                                                                                                                                    |
| `Town`                                             | Text                                                                                                                                                        |
| `Division`                                         | One or more of: `Junior Division (6-8)`, `Senior Division (9-12)`, `Young Historians (4-5)` — separate multiple with commas if a school spans more than one |
| `Implementation Model`                             | One of: `Student participate independently`, `Curricular requirement (class or grade level)`, `Co-curricular club`, `Other`                                 |
| `School Type`                                      | One of: `Public School`, `Public Charter`, `Private/ Independent`, `Private/ Parochial/Religious`, `Other`                                                  |
| `# students who began project at the school level` | A number — **the only column on either sheet that's allowed to be left blank.** This is the "participating students" figure described in Step 2 below.      |

For the Division, Implementation Model, and School Type columns, the cell
text has to match one of the listed options exactly (again, case and
surrounding spaces don't matter, but the wording does) — anything else is
rejected as an invalid value rather than silently accepted.

**Only the columns listed above are ever read from your spreadsheet — any
other column you include is ignored and never stored.** In particular, the
student spreadsheet has no column for a student's name, ID, or any other
identifying information, and the app doesn't add one: students are recorded
purely as a **count** (how many worked on a given project), never as
individuals. Teachers, by contrast, are identified by name and email, since
the app needs to attribute projects to a specific person.

### Step 1 — Student data

1. Choose the **year** this data is for. A colored dot next to the year
   shows whether that year already has data: **green = data exists
   (uploading will overwrite it)**, **red = no data yet**. If the year
   already has data, a warning appears: _"Data already exists for [year].
   Uploading will overwrite it."_
2. Upload the student spreadsheet — either drag the file onto the box, or
   click it to browse your computer. Only **.xlsx** and **.csv** files are
   accepted; anything else shows an error under the box. A **Download
   template** link is provided if you need a blank starting file.
3. Click **Next**. The file is checked for formatting problems.
    - If it passes, you'll see **"Your file looks good"** along with a
      preview of the **Top Participating Schools** in the file, so you can
      sanity-check that the numbers look right before continuing.
    - If it fails, you'll see **"This file can't be imported"** with a list
      of every problem found, including the exact cell and what value was
      expected. You cannot fix errors inside the app — correct the
      spreadsheet in Excel/Google Sheets and upload it again.

### Step 2 — School data

Same process as Step 1, but for the school-level spreadsheet (school name,
town, division, implementation model, school type, and **# students who
began project at the school level** — this column is what the rest of the
app calls "participating students") and its own template. Its review step
shows a plain preview of the first several rows rather than a "top schools"
summary.

**If a school appears more than once in this spreadsheet:** the app does
**not** treat that as an error, and it does **not** overwrite one row with
the other. It **adds together** the "# students who began project at the
school level" numbers from every row for that school. For example, if
Springfield High is accidentally listed twice with 20 and 15 in that column,
the app will record **35 participating students** for Springfield High that
year, not 20 or 15. However, if those duplicate rows disagree on Division,
Implementation Model, or School Type, only the values from the **first** row
for that school are kept — values on later duplicate rows for those fields
are silently ignored. **Double-check for accidental duplicate rows and
inconsistent details before uploading**, since the app will quietly total the
student counts rather than warn you.

### How schools are matched to prior years

Every school in the system has one permanent record that its history —
projects, students, teachers, location — accumulates on year after year.
When you upload a school, the app has to decide: is this the same school as
one already on file, or a new one? Knowing how that decision gets made helps
explain why a school occasionally shows up as a duplicate, and what to do
about it.

- **Matching is based on the school's name and town, not the "School id"
  number in your spreadsheet.** That id column is required and validated
  (it must be present and numeric), but the app doesn't actually use it to
  connect a row to an existing school — matching is done purely from the
  **School name** and **Town** columns.
- The name comparison is deliberately loose: it lowercases the name, strips
  generic filler words like "public," "school," "district," "the," and
  "and," and ignores punctuation. So "Boston Public Schools" and "Boston
  School" are treated as the same name. **Town, on the other hand, has to
  match exactly** (case doesn't matter, but spelling does) — the same school
  name under a differently-spelled or misspelled town will **not** be
  recognized as the same school.
- In short: if a school's name is close enough (once filler words and
  punctuation are ignored) _and_ its town is spelled identically to a prior
  upload, it's automatically linked to that school's existing record and its
  history keeps building. Otherwise, it's treated as brand new.

**When a name doesn't quite match:** if a school in your file looks like it
might be an existing school under a slightly different name (or its town
genuinely changed spelling), a **School Name Conflicts** dialog may appear
between the School step and the Location step, asking you to choose whether
to treat them as the same school or keep them separate. Choosing "same
school" links the new name into that school's history — the same mechanism
used by the **Rename School** action on the ⋮ menu (see [School
Profile](#7-school-profile-page)) — so future uploads under either name
still resolve correctly. This choice is remembered for future uploads of the
same school.

### Step 3 — Location

- Schools are matched to a map location automatically wherever possible. If
  every school matched, you'll see **"All [N] school(s) matched
  automatically"** and can move straight on.
- For any schools that couldn't be matched, you'll be asked to place them
  one at a time: a counter shows how many are left, and the instruction
  **"Click on the map to place the pin, then press Next to confirm."**
  Clicking outside Massachusetts shows an error and won't place a pin. Once
  placed, you'll see a confirmation like **"Location set: [coordinates]."**
  The contest region is calculated automatically once a location is set.

**Every school needs a location — even ones with no team that year.** The
app enforces this rule: any school it doesn't already know a location for is
brought into this step, whether it appeared in the student spreadsheet, the
school spreadsheet, or both. That includes a school that had **no competing
students, no projects, and no teachers** entered — for example, one you only
listed in the School Info sheet to record its participating-student count.
If the app can't already place it on the map from prior years' data, you
will still be stopped here and asked to click its location before you can
finish the upload.

### Step 4 — Confirm

- A summary shows four counts pulled from your files: **schools, students,
  teachers, projects.** The **schools** count includes every school found in
  either spreadsheet — including a school that only appears in the School
  data sheet with participating students and no competing team. The
  **students** count, however, only counts rows in the student/project
  spreadsheet (competing students); it does **not** add in the
  participating-student figures from the School data sheet, so it's normal
  for that number to look smaller than your total participating-student
  count — those totals appear afterward, on each school's own profile page
  and on the Dashboard.
- If the chosen year already had data, a prominent red warning box appears:
  _"Warning: you are about to overwrite existing data for [year]."_ /
  _"This action cannot be undone."_
- You must check **"I understand this action may affect existing data"**
  before **Finish Upload** becomes clickable.
- Once you click Finish Upload, a progress bar shows the upload percentage.

**Important — do not close the tab or navigate away while an upload is in
progress.** If you try to leave mid-upload, the app warns you: _"Leaving now
will result in incomplete data being saved. The year will appear as uploaded
in Settings but will be missing records."_ If this happens by accident, go to
**Settings → Available Data** — the year will show an **Incomplete** status,
and the safest fix is to re-run the upload for that year from scratch.

Once finished, you can confirm the upload worked by checking **Settings →
Available Data**, where the year should show a green **Uploaded** status.

---

## 9. Settings Page

Administrative settings that apply across the whole app for every
administrator — there's no per-person customization, so a change made here
affects what everyone sees. Most of this page uses a shared **Save /
Discard** bar at the bottom — a pulsing dot and **"Unsaved changes"** text
appear whenever something on the page has been changed but not yet saved.
Nothing on these sections (except Authorized Users, see below) takes effect
until you click **Save**.

### Gateway Cities

Search for a school and select it to mark it as representing students from a
Massachusetts Gateway City — this flag is used throughout the app (e.g. the
Map's "Gateway Schools Only" filter, and the Chart page's Gateway School
filter/grouping option). Gateway status is a permanent attribute of the
school, not tied to a specific year — marking a school here applies to its
data in every year, past and future, not just the year currently selected
elsewhere in the app.

- Adding a school shows it highlighted green with an **Adding** label until
  you save.
- Removing one highlights it red with strikethrough text and a **Removing**
  label — click the undo icon next to it if you change your mind before
  saving.

### School Locations

Search for a school, then click on the map to propose a new location for it
(the same click-to-place, must-be-in-Massachusetts behavior described under
[School Profile](#editing-the-schools-location)). This is saved together
with everything else via the page's main **Save** button.

### Available Data

A table of every year currently in the system, with its status:

| Status                 | Meaning                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Uploaded** (green)   | Fully and successfully uploaded                                                                                                                                                                           |
| **Incomplete** (amber) | An upload for this year was interrupted partway through — some records may be missing                                                                                                                     |
| **Missing** (red)      | No data uploaded for this year. (This status only shows for years between two years that do have fully uploaded data — a year with no data beyond the earliest/latest uploaded year simply isn't listed.) |
| **Deleting** (red)     | You've staged this year for deletion but haven't saved yet                                                                                                                                                |

- Years with data show a **trash-can** icon — click it to stage that year's
  data for deletion (it doesn't delete immediately; you can click the undo
  icon to cancel before saving).
- Years without data show an **upload** icon that takes you straight to the
  Upload Data flow with that year already filled in.
- When you click **Save** with a year staged for deletion, you'll get one
  final confirmation dialog: **"Permanently delete [N] year(s) of data?"**
  listing each year and how many projects it contains, with the warning
  _"This action cannot be undone."_ You must click **Delete permanently** to
  proceed, or **Cancel** to back out.

**Important:** if you cancel that final delete confirmation, _none_ of your
other pending Settings changes (Gateway Cities, School Locations) are saved
either in that same click — you'll need to resolve the delete decision and
click **Save** again to apply everything.

Each year's **Last Updated** timestamp reflects the most recent change to
that year's data anywhere in the app — not just a fresh upload. Editing a
project or a teacher's details on a [School Profile](#editing-project-records)
page for a given year updates that year's timestamp here too.

### Authorized Users

Manage which email addresses are allowed to sign in as an administrator.

**Unlike every other section on this page, changes here take effect
immediately** — there's no staging, no Save button, and no confirmation
dialog before removing someone's access. Double-check before removing an
email; there's no undo.

---

## 10. Frequently Asked Questions

**Does this app store personally identifying student information?**
No. Students are recorded only as counts (how many worked on a project) —
never by name, ID, or any other identifying detail. Even if your source
spreadsheet has extra columns with student names or other information, the
app only reads the specific columns it needs (see [Required spreadsheet
columns](#required-spreadsheet-columns) in Section 8) — anything beyond
that is ignored and never stored. Teachers are the one exception: they're
identified by name and email, since projects need to be attributed to a
specific supervising teacher.

**A page shows a spinner and never finishes loading.**
Check your internet connection. If it's still stuck after a minute, refresh
the page. If a **Try Again** button appears instead, click it.

**A chart says "No Data Found."**
The combination of Measured As / Group By / Filters you've chosen doesn't
produce any matching records — this is expected behavior, not an error. Try
loosening a filter or picking a different Measured As / Group By pair.

**I don't see a colored dot next to the year on the Dashboard, Map, Schools,
or School Profile pages.**
That's expected — those dropdowns only ever list years that already have
data, so there's nothing extra to mark. The colored dots you _will_ see are
in the Upload Data flow (green/red = year has/doesn't have data yet).

**I uploaded the wrong file or made a data mistake.**
Re-run Upload Data for the same year — it will overwrite what's there after
you confirm the warning. For smaller corrections to individual projects or
teachers, edit them directly on the relevant [School Profile](#editing-project-records)
page instead of re-uploading everything.

**I need to remove a whole year of bad data.**
Go to **Settings → Available Data**, stage that year for deletion, and
confirm. This is permanent.

**Someone can't sign in.**
An administrator needs to add their email under **Settings → Authorized
Users** first.

**I merged the wrong schools, or deleted the wrong year.**
These actions are permanent and cannot be undone from within the app. If
this happens, contact the JumboCode team — see below.

---

## 11. Setting Up Resend (Sign-In Emails)

The app has no passwords — signing in works by emailing a one-time code (see
[Section 1](#signing-in)). Those emails are sent through **Resend**, a
third-party email-sending service. This section covers setting that up; it's
a prerequisite for [Deploying the Application](#12-deploying-the-application)
below.

An **API key** is a long string of letters and numbers that works like a
password for software instead of a person — it's how the MHD application
proves to Resend that it's allowed to send emails through your account, without
you having to hand over your actual Resend login.

### Step 1 — Create a Resend account

Go to https://resend.com/signup and register for an account.

### Step 2 — Verify your sending domain

Sign-in emails need to come from an address on a domain you control (e.g.
`masshist.org`), and Resend requires that domain to be verified before it
will send from it:

1. In the Resend dashboard, click **Domains** in the left sidebar, then
   **Add Domain** in the top right, and enter your domain.
2. Resend will show you a handful of DNS records to add (typically TXT and
   MX/CNAME records for verification and deliverability). Add these at
   wherever your domain's DNS is managed — Resend can't do this for you.
3. Wait for the domain to show as **Verified** in the Resend dashboard.
   This is usually quick, but DNS changes can occasionally take a few hours
   to fully propagate.
4. Decide on a "from" address using that domain, e.g. `mhd@masshist.org`.
   You don't need to create an actual inbox for it — Resend just needs to be
   allowed to send _as_ that address. You'll use this as the `EMAIL_FROM`
   value in [Deploying the Application](#12-deploying-the-application).

### Step 3 — Create an API key

1. Click **API Keys** in the left sidebar, then **Create API Key** in the
   top right.
2. Give it a name (anything works — this is just for your own reference and
   doesn't affect how the app functions). Leave Permission and Domain on
   their defaults and click **Add**.
3. Resend will show you the key once, in a **View API Key** dialog with a
   note that says _"You can only see this key once. Store it safely."_ Click
   the copy icon and paste it somewhere safe immediately (a password
   manager, or a temporary note you'll delete once it's in Vercel) — if you
   close this dialog without copying it, you cannot retrieve it again and
   will need to create a new key.

You'll paste this value in as the `RESEND_API_KEY` environment variable when
you deploy in the next section.

### Free plan limits

By default, new Resend accounts are on the free plan, which allows:

- 3,000 emails/month
- 100 emails/day
- 5 emails/second

This is a limit on sign-in emails to _administrators_, not to MHD's ~6,000
program participants — the app never emails students or teachers — so you're
very unlikely to come close to these limits. If you ever did hit the daily
or monthly cap, emails would simply stop sending until the limit resets; no
data is lost.

### If you lose your API key

Keys can't be viewed again after their one-time reveal, but you can always
create a new one:

1. In the Resend dashboard, click **API Keys → Create API Key**.
2. Name it, leave the defaults, and click **Add**.
3. Copy the new key and update the `RESEND_API_KEY` environment variable in
   Vercel (**Settings → Environment Variables**), then redeploy.

You may want to delete the old, no-longer-used key from the API Keys list
afterward, though this isn't required.

---

## 12. Deploying the Application

This section covers deploying the application from scratch, using **Vercel**
(hosting), **Neon** (database), and **Resend** (sign-in emails, set up in
[Section 11](#11-setting-up-resend-sign-in-emails)). Everything below is
done through each service's web dashboard; no local toolchain is required.
Budget about 15 minutes, plus whatever time your domain's DNS takes to
propagate in Section 11.

**Here's the shape of the process, so nothing below is a surprise:** with
Resend already set up in Section 11, you'll generate a random secret key,
make your own copy of the code on GitHub (a "fork"), import that copy into
Vercel and hand it the values you've generated, connect a free database
(Neon) once the site is live, and tell the app its own web address. Each of
those is one short step below, in that order — Step 1 is prep you do before
touching Vercel at all, and Steps 2–5 get the site live. Steps 6–7 aren't
setup at all — they just explain how to pull in future updates, and how to
confirm everything's working once you're done.

### What you'll need before starting

1. A **GitHub** account — you likely already have one; if not, sign up at
   https://github.com/signup
2. A **Vercel** account, signed in with that GitHub account —
   https://vercel.com/signup
    - The free **Hobby** plan is sufficient.
3. A **Resend** account with a verified domain and an API key — see
   [Section 11](#11-setting-up-resend-sign-in-emails) if you haven't done
   this yet.

You do **not** need to separately sign up for **Neon** (the database)
beforehand — Step 4 below provisions it automatically through Vercel's
Marketplace, creating the database and linking it to your project in one
click, tied to your Vercel account.

### Environment variables

The app is configured entirely through **environment variables** — key/value
pairs Vercel injects into the app at build and run time, rather than
anything hardcoded in the code. In Vercel these live under your project's
**Settings → Environment Variables**. It's worth knowing what each one is
and where its value comes from before you start — you'll be typing three of
these in by hand during Step 3 — and that same Settings screen is where
you'd go later to view, edit, or rotate any of them.

| Variable             | What it's for                                                                       | Where the value comes from                                                                           |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Lets the app send the one-time sign-in code emails through Resend                   | Resend — [Section 11](#11-setting-up-resend-sign-in-emails)                                          |
| `EMAIL_FROM`         | The "from" address those sign-in emails are sent from                               | An address on the domain you verified in Resend — [Section 11](#11-setting-up-resend-sign-in-emails) |
| `BETTER_AUTH_SECRET` | Random key used to sign and encrypt sign-in sessions                                | You generate it yourself — Step 1 below                                                              |
| `DATABASE_URL`       | Postgres connection string                                                          | Set automatically when you add the Neon integration — Step 4 — you never touch this one directly     |
| `BETTER_AUTH_URL`    | The public URL the app is running at, so auth callbacks/redirects resolve correctly | The `*.vercel.app` URL Vercel gives you after deploying — Step 5                                     |

### Step 1 — Generate an auth secret

Open https://generate-secret.vercel.app/32 in your browser. Copy the random
string it shows. This will be your `BETTER_AUTH_SECRET` — you'll paste it in
during Step 3.

### Step 2 — Fork the repository

1. Go to https://github.com/JumboCode/mhd and click **Fork** in the top
   right.
2. Leave the settings as they are and click **Create fork**. This creates
   your own independent copy of the repository under your GitHub account.

This step matters: it's what makes automatic updates (Step 6) possible
later. GitHub's update mechanism only works between a genuine fork and its
original repository — importing the code into Vercel some other way (for
example, a "Deploy" button that copies the code without going through
GitHub's own Fork feature) doesn't create that relationship, and your copy
would never be able to pull in updates. Forking here guarantees it does.

### Step 3 — Import into Vercel and deploy

1. Go to https://vercel.com/new.
2. Under **Import Git Repository**, find and select the fork you just
   created (search for `mhd`). If you don't see it listed, click **Adjust
   GitHub App Permissions** and grant Vercel access to the repository.
3. On the **Configure Project** screen, expand **Environment Variables** and
   add the three variables below one at a time (type the name, paste the
   value, click **Add**):
    - `RESEND_API_KEY` — the key from Section 11
    - `EMAIL_FROM` — the sender address from Section 11 (e.g.
      `mhd@masshist.org`)
    - `BETTER_AUTH_SECRET` — the random string from Step 1
4. Click **Deploy**. The first build takes about a minute or two and will
   succeed even without a database connected yet — the site just won't be
   usable (no sign-in, no data) until Step 4.

### Step 4 — Add the database (Neon)

1. Open your new project in the Vercel dashboard and click the **Storage**
   tab.
2. Click **Create Database** (or **Connect Database**), choose **Neon**,
   accept the Neon terms (one time only), and choose the **Free** plan.
3. If the panel offers an **Auth** add-on ("Provide built-in authentication
   for app users, with profiles synced to Postgres"), unclick it — the app
   already handles sign-in itself and doesn't use Neon's version.

This automatically creates the `DATABASE_URL` environment variable and
connects it to your project — you don't need to copy or type anything.

**Before moving on, create the database's tables.** A brand-new database is
completely empty — nothing in this process creates the tables the app
needs on its own, so you have to run this once:

1. Still on the database page, click the **Query** tab. (If you've
   navigated away, get back here from the Vercel dashboard by clicking your
   project, then **Storage** in the sidebar, then the database name, then
   **Query**.)
2. In the top left corner, disable **Read-only** — since we're writing
   changes, this needs to be off. A warning popup appears explaining that
   turning off read-only mode allows queries to create, update, or delete
   data, and that changes made this way cannot be undone. Click **Disable
   Read-Only**.
3. Paste the block below in full and click **Run**. It creates all 12
   tables the app uses.

```sql
DO $migration$
BEGIN
  EXECUTE $ddl$CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"division" text NOT NULL,
	"category_id" text NOT NULL,
	"category" text NOT NULL,
	"year" integer NOT NULL,
	"team_project" boolean NOT NULL,
	"num_students" integer DEFAULT 1 NOT NULL
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "school_historic_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"absorbing_school_id" integer NOT NULL,
	"merged_name" text NOT NULL,
	"merged_standardized_name" text NOT NULL,
	"merged_external_school_id" text,
	CONSTRAINT "school_historic_names_merged_standardized_name_unique" UNIQUE("merged_standardized_name")
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"standardized_name" text NOT NULL,
	"town" text,
	"school_id" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"zipcode" text,
	"gateway" boolean DEFAULT false NOT NULL,
	"region" text DEFAULT '' NOT NULL,
	CONSTRAINT "schools_school_id_unique" UNIQUE("school_id")
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"teacher_id" text NOT NULL,
	CONSTRAINT "teachers_teacher_id_unique" UNIQUE("teacher_id")
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "year_metadata" (
	"year" integer PRIMARY KEY NOT NULL,
	"uploaded_at" timestamp NOT NULL,
	"last_updated_at" timestamp NOT NULL
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "yearly_school_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"year" integer NOT NULL,
	"division" text[] DEFAULT '{}' NOT NULL,
	"implementation_model" text DEFAULT '' NOT NULL,
	"school_type" text DEFAULT '' NOT NULL
);$ddl$;
  EXECUTE $ddl$CREATE TABLE "yearly_teacher_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"year" integer NOT NULL
);$ddl$;
  EXECUTE $ddl$ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "projects" ADD CONSTRAINT "projects_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "projects" ADD CONSTRAINT "projects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "school_historic_names" ADD CONSTRAINT "school_historic_names_absorbing_school_id_schools_id_fk" FOREIGN KEY ("absorbing_school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "yearly_school_participation" ADD CONSTRAINT "yearly_school_participation_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "yearly_teacher_participation" ADD CONSTRAINT "yearly_teacher_participation_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;$ddl$;
  EXECUTE $ddl$ALTER TABLE "yearly_teacher_participation" ADD CONSTRAINT "yearly_teacher_participation_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;$ddl$;
  EXECUTE $ddl$CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");$ddl$;
  EXECUTE $ddl$CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");$ddl$;
  EXECUTE $ddl$CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");$ddl$;
  EXECUTE $ddl$ALTER TABLE "yearly_school_participation" ADD COLUMN "competing_students" integer DEFAULT 0 NOT NULL;$ddl$;
  EXECUTE $ddl$ALTER TABLE "schools" DROP CONSTRAINT "schools_school_id_unique";$ddl$;
  EXECUTE $ddl$ALTER TABLE "schools" ALTER COLUMN "town" SET DEFAULT '';$ddl$;
  EXECUTE $ddl$ALTER TABLE "schools" ALTER COLUMN "town" SET NOT NULL;$ddl$;
  EXECUTE $ddl$ALTER TABLE "schools" ALTER COLUMN "school_id" DROP NOT NULL;$ddl$;
  EXECUTE $ddl$CREATE UNIQUE INDEX "schools_standardized_name_town_idx" ON "schools" USING btree ("standardized_name","town");$ddl$;
  EXECUTE $ddl$ALTER TABLE "school_historic_names" DROP CONSTRAINT "school_historic_names_merged_standardized_name_unique";$ddl$;
  EXECUTE $ddl$ALTER TABLE "school_historic_names" ADD COLUMN "merged_town" text DEFAULT '' NOT NULL;$ddl$;
  EXECUTE $ddl$CREATE UNIQUE INDEX "school_historic_names_name_town_idx" ON "school_historic_names" USING btree ("merged_standardized_name","merged_town");$ddl$;
  EXECUTE $ddl$CREATE TABLE "allowed_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "allowed_emails_email_unique" UNIQUE("email")
);$ddl$;
END $migration$;
```

**Then add yourself as the first administrator.** The app is
admin-only and starts with an empty list of authorized sign-in emails —
since there's no one signed in yet to add the first one through the app
itself (see [Authorized Users](#authorized-users) under Settings — that's
how you'd normally do this, but it requires being signed in already), you
have to insert it directly:

1. Navigate to the **Query** tab if you're not still on it.
2. Paste the following, replacing the email with whichever address should
   be the first administrator, and click **Run**:
    ```sql
    INSERT INTO allowed_emails (email) VALUES ('your-email@example.com');
    ```

Once this runs, that email can sign in and can add any other administrators
from Settings inside the app itself — you won't need to touch this SQL
editor again.

### Step 5 — Add your site URL

1. On your project's **Deployments** tab, copy the URL of your deployment —
   it looks like `https://mhd-abc123.vercel.app`.
2. Open **Settings → Environment Variables**, click **Add**, name it
   `BETTER_AUTH_URL`, paste the URL, set it for all three environments
   (Production, Preview, Development), and save.
3. Open the **Deployments** tab, click the most recent deployment's `…` menu,
   and click **Redeploy**. This picks up both `BETTER_AUTH_URL` and the
   `DATABASE_URL` from Step 4 in one build.

You're live.

### Step 6 — Getting updates later

No setup needed here — this is just how it works. Updates from the
JumboCode team don't apply themselves automatically; when JumboCode ships
one, they'll let you know, and someone with access to your fork applies it.
Either of these does the same thing — use whichever you find first:

- **The simplest way:** open your fork's main page on GitHub. If it's
  behind `JumboCode/mhd`, you'll see a banner near the top reading
  something like _"This branch is N commits behind JumboCode/mhd:main."_
  Click **Sync fork**, then **Update branch**.
- **The alternative:** open your fork and go to the **Actions** tab.
    - The first time you open it, you may see _"Workflows aren't being run
      on this forked repository."_ Click **I understand my workflows, go
      ahead and enable them** to proceed.
    - On the left sidebar, click **Sync from upstream** — a custom workflow
      that syncs changes from the original repository into yours. The first
      time you open it, it may show a banner reading _"This scheduled
      workflow is disabled because scheduled workflows are disabled by
      default in forks."_ Click **Enable workflow**.
    - Note: once enabled, this workflow runs automatically for up to 60 days
      since the last change to your repository. After that, GitHub disables
      it automatically — meaning it'll stay in sync with JumboCode's
      repository for a while, then stop checking if your fork has been
      inactive (no commits/pulls) for 60 days straight. You can always come
      back to this page and click **Enable workflow** again to resume it.

Either method pulls in the latest changes from JumboCode's repository and
pushes them to your fork's `main` branch. Vercel is already watching that
branch, so it automatically rebuilds and redeploys the site within a couple
of minutes — nothing further to do after that.

### Step 7 — Confirm it's working

1. Visit your site's URL from Step 5.
2. Sign in with your email — you should receive a one-time code within a
   minute or two and be able to sign in with it. If nothing arrives, check
   spam, then double check the `RESEND_API_KEY`/`EMAIL_FROM` values from
   Section 11 under **Settings → Environment Variables**. If sign-in still
   rejects your email as unauthorized, see [Authorized
   Users](#authorized-users) — you'll need at least one email seeded into
   the allowed list before anyone can sign in at all.
3. You'll land on an empty Dashboard — that's expected, since no contest
   data has been uploaded yet. Head to **[Uploading
   Data](#8-uploading-data)** whenever you're ready to add your first year.
4. Note: since sign-in relies on reading email addresses from the
   `allowed_emails` table you seeded in Step 4, a successful sign-in is a
   good sign that everything — database, environment variables, and
   Resend — is working correctly.

### Adding a custom domain (optional)

The site works permanently at the `*.vercel.app` URL from Step 5 — there's
no requirement to move off it. If you'd rather serve the site from your own
domain (e.g. `masshist.org`) instead, that's a Vercel-side change:

1. In the Vercel dashboard, open **Settings → Domains**, click **Add
   Existing**, and enter your domain (including any subdomain, e.g.
   `mhd.masshist.org`).
2. Vercel will show you DNS records (usually an `A` or `CNAME` record) to
   add. Add those records at your domain registrar/DNS provider — Vercel
   doesn't manage your DNS for you.
3. Once DNS propagates (can take anywhere from a few minutes to a few
   hours), Vercel marks the domain as verified.
4. Update the `BETTER_AUTH_URL` environment variable to your new domain and
   redeploy.

---

## 13. Getting More Help

- The **Help** button in the sidebar opens a shorter, page-specific version
  of this manual right inside the app — useful as a quick reminder while
  you're working.
- For anything else — a bug, a deploy issue, a question not covered here —
  contact the JumboCode team, or open an issue on the project's GitHub
  repository.
