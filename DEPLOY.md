# Deploying Massachusetts History Day

This guide walks a non-technical maintainer through deploying the site from
scratch. It takes about 15 minutes total and only uses a web browser.

## What you'll need before starting

1. A **GitHub** account — https://github.com/signup
2. A **Vercel** account, signed in with that GitHub account — https://vercel.com/signup
    - Choose the **Pro** plan ($20/month). The free Hobby plan is for personal
      projects only and is not allowed for organizational use.
3. A **Resend** account for sending sign-in emails — https://resend.com/signup
4. A domain you control (e.g. `mhd.org`) so emails come from your own address.

## Step 1 — Set up Resend

1. Sign in to https://resend.com.
2. Click **Domains → Add Domain**, enter your domain (e.g. `mhd.org`),
   and follow the DNS instructions Resend gives you. Wait until the domain
   shows as **Verified** (usually a few minutes).
3. Click **API Keys → Create API Key**, name it `MHD`, and copy the key
   somewhere safe. You'll paste it into Vercel in the next step.
4. Decide on a "from" email address using your verified domain, e.g.
   `noreply@mhd.org`. You'll also paste this into Vercel.

## Step 2 — Generate an auth secret

Open https://generate-secret.vercel.app/32 in your browser. Copy the random
string it shows. This will be your `BETTER_AUTH_SECRET`.

## Step 3 — Click Deploy

Click the Deploy button in the [README](./README.md). Vercel will:

1. Ask you to authorize GitHub. A copy of the code will be cloned into your
   GitHub account as a new repository.
2. Show a form asking for **3 environment variables** — paste in:
    - `RESEND_API_KEY` — the key from Step 1
    - `EMAIL_FROM` — the sender address from Step 1 (e.g. `noreply@mhd.org`)
    - `BETTER_AUTH_SECRET` — the random string from Step 2
3. Show a **Storage** panel with **Neon** preselected. Click it, accept the
   Neon terms (one time only), and choose the **Free** plan.
4. Click **Deploy** at the bottom. The first build takes about 2 minutes.

## Step 4 — Add your site URL

Once the deploy finishes, Vercel will show a URL like
`https://mhd-abc123.vercel.app`. Copy it, then:

1. In the Vercel dashboard, open **Settings → Environment Variables**.
2. Click **Add**, name it `BETTER_AUTH_URL`, paste your URL, set it for all
   three environments (Production, Preview, Development), and save.
3. Open the **Deployments** tab, click the most recent deployment's `…` menu,
   and click **Redeploy**.

You're live.

## Step 5 — Enable automatic updates (one-time)

The site is set up to pull in updates from the JumboCode team automatically
once a day. To turn that on:

1. Open your new repository on GitHub.
2. Click the **Actions** tab. You'll see a banner: _"Workflows aren't being
   run on this forked repository."_ Click **I understand my workflows, go
   ahead and enable them**.

That's it. From now on, when the JumboCode team ships an update, your site
will pick it up automatically within 24 hours and Vercel will redeploy it.

If you ever want an update sooner, go to **Actions → Sync from upstream →
Run workflow** and click the green button.

## Adding a custom domain (optional)

In the Vercel dashboard, open **Settings → Domains**, click **Add**, and
enter your domain (e.g. `mhd.org`). Vercel will show DNS records to add at
your domain registrar. Once DNS propagates, update the `BETTER_AUTH_URL`
env var to use the custom domain and redeploy.

## Getting help

If anything goes wrong, contact the JumboCode team or open an issue at
https://github.com/jumbocode/mhd/issues.
