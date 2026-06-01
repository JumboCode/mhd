# Deploying Massachusetts History Day

This guide covers deploying this application from scratch, using Vercel,
Neon, and Resend. Everything below is done through each service's web
dashboard; no local toolchain is required. Budget about 15 minutes.

**Here's the shape of the process, so nothing below is a surprise:** you'll
set up an email-sending service (Resend) and generate a random secret key,
make your own copy of the code on GitHub (a "fork"), import that copy into
Vercel and hand it the values you just generated, connect a free database
(Neon) once the site is live, and tell the app its own web address. Each of
those is one short step below, in that order — Steps 1–2 are prep you do
before touching Vercel at all, and Steps 3–6 get the site live. Steps 7–8
aren't setup at all — they just explain how to pull in future updates, and
how to confirm everything's working once you're done.

## What you'll need before starting

1. A **GitHub** account — you likely already have one; if not, sign up at
   https://github.com/signup
2. A **Vercel** account, signed in with that GitHub account — https://vercel.com/signup
    - The free **Hobby** plan is sufficient.
3. A **Resend** account for sending sign-in emails — https://resend.com/signup
4. A domain you control (e.g. `masshist.org`) so sign-in emails come from your own
   address — Resend requires a verified domain to send from. This is only
   used for the _email address_; it does not have to be the domain the site
   itself lives at. By default the site runs permanently at a `*.vercel.app`
   URL, which is entirely fine to keep — using this (or any) domain to host
   the site instead is optional, see [Adding a custom
   domain](#adding-a-custom-domain-optional) below.

## Environment variables

The app is configured entirely through **environment variables** — key/value
pairs Vercel injects into the app at build and run time, rather than
anything hardcoded in the code. In Vercel these live under your project's
**Settings → Environment Variables**. It's worth knowing what each one is
and where its value comes from before you start — you'll be typing these in
by hand during Step 4 — and that same Settings screen is where you'd go
later to view, edit, or rotate any of them.

| Variable             | What it's for                                                                       | Where the value comes from                                                                       |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`     | Lets the app send the one-time sign-in code emails through Resend                   | Your Resend account — Step 1                                                                     |
| `EMAIL_FROM`         | The "from" address those sign-in emails are sent from                               | An address on the domain you verify in Resend — Step 1                                           |
| `BETTER_AUTH_SECRET` | Random key used to sign and encrypt sign-in sessions                                | You generate it yourself — Step 2                                                                |
| `DATABASE_URL`       | Postgres connection string                                                          | Set automatically when you add the Neon integration — Step 5 — you never touch this one directly |
| `BETTER_AUTH_URL`    | The public URL the app is running at, so auth callbacks/redirects resolve correctly | The `*.vercel.app` URL Vercel gives you after deploying — Step 6                                 |

## Step 1 — Set up Resend

1. Sign in to https://resend.com.
2. Click **Domains → Add Domain**, enter your domain (e.g. `masshist.org`),
   and follow the DNS instructions Resend gives you. Wait until the domain
   shows as **Verified** (usually a few minutes).
3. Click **API Keys → Create API Key**, name it `MHD`, and copy the key
   somewhere safe. You'll paste it into Vercel in Step 4.
4. Decide on a "from" email address using your verified domain, e.g.
   `mhd@masshist.org`. You'll also paste this into Vercel in Step 4.

## Step 2 — Generate an auth secret

Open https://generate-secret.vercel.app/32 in your browser. Copy the random
string it shows. This will be your `BETTER_AUTH_SECRET` — paste it in Step 4.

## Step 3 — Fork the repository

1. Go to https://github.com/JumboCode/mhd and click **Fork** in the top
   right.
2. Leave the settings as they are and click **Create fork**. This creates
   your own independent copy of the repository under your GitHub account.

This step matters: it's what makes automatic updates (Step 7) possible
later. GitHub's update mechanism only works between a genuine fork and its
original repository — importing the code into Vercel some other way (for
example, a "Deploy" button that copies the code without going through
GitHub's own Fork feature) doesn't create that relationship, and your copy
would never be able to pull in updates. Forking here guarantees it does.

## Step 4 — Import into Vercel and deploy

1. Go to https://vercel.com/new.
2. Under **Import Git Repository**, find and select the fork you just
   created (search for `mhd`). If you don't see it listed, click **Adjust
   GitHub App Permissions** and grant Vercel access to the repository.
3. On the **Configure Project** screen, expand **Environment Variables** and
   add the three variables below one at a time (type the name, paste the
   value, click **Add**):
    - `RESEND_API_KEY` — the key from Step 1
    - `EMAIL_FROM` — the sender address from Step 1 (e.g. `mhd@masshist.org`)
    - `BETTER_AUTH_SECRET` — the random string from Step 2
4. Click **Deploy**. The first build takes about a minute or two and will
   succeed even without a database connected yet — the site just won't be
   usable (no sign-in, no data) until Step 5.

## Step 5 — Add the database (Neon)

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
itself, you have to insert it directly:

1. Navigate to the **Query** tab if you're not still on it.
2. Paste the following, replacing the email with whichever address should
   be the first administrator, and click **Run**:
    ```sql
    INSERT INTO allowed_emails (email) VALUES ('your-email@example.com');
    ```

Once this runs, that email can sign in and can add any other administrators
from **Settings** inside the app itself — you won't need to touch this SQL
editor again.

## Step 6 — Add your site URL

1. On your project's **Deployments** tab, copy the URL of your deployment —
   it looks like `https://mhd-abc123.vercel.app`.
2. Open **Settings → Environment Variables**, click **Add**, name it
   `BETTER_AUTH_URL`, paste the URL, set it for all three environments
   (Production, Preview, Development), and save.
3. Open the **Deployments** tab, click the most recent deployment's `…` menu,
   and click **Redeploy**. This picks up both `BETTER_AUTH_URL` and the
   `DATABASE_URL` from Step 5 in one build.

You're live.

## Step 7 — Getting updates later

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

## Step 8 — Confirm it's working

1. Visit your site's URL from Step 6.
2. Sign in with your email — you should receive a one-time code within a
   minute or two and be able to sign in with it. If nothing arrives, check
   spam, then double check the `RESEND_API_KEY`/`EMAIL_FROM` values from
   Step 1 under **Settings → Environment Variables**.
3. You'll land on an empty Dashboard — that's expected, since no contest
   data has been uploaded yet. Head to **Upload Data** in the sidebar
   whenever you're ready to add your first year. See the User Manual for
   how to use the rest of the app day to day.
4. Note: since sign-in relies on reading email addresses from the
   `allowed_emails` table you seeded in Step 5, a successful sign-in is a
   good sign that everything — database, environment variables, and
   Resend — is working correctly.

## Adding a custom domain (optional)

The site works permanently at the `*.vercel.app` URL from Step 6 — there's
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

## Getting help

If anything goes wrong, contact the JumboCode team or open an issue at
https://github.com/jumbocode/mhd/issues.
