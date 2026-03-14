# Resend Email Setup — Whisper Nuance

The success page sends confirmation emails to **both** the customer and Whissspernuance@gmail.com using [Resend](https://resend.com).

## One-time setup (about 2 minutes)

1. **Sign up** at [resend.com](https://resend.com) (free tier: 3,000 emails/month).

2. **Create an API key:**
   - Dashboard → **API Keys** → **Create API Key**
   - Name it (e.g. `whispernuance`) and copy the key.

3. **Add the key in Vercel:**
   - Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**
   - Add:
     - **Name:** `RESEND_API_KEY`
     - **Value:** (paste your Resend API key)
   - Save.

4. **Redeploy** (Vercel → Deployments → Redeploy latest).

## What the emails look like

Both emails use the same style as your site (purple gradient, Whisper Nuance branding).

- **Customer** receives: confirmation with package, amount paid, date & time, and duration.
- **Whissspernuance@gmail.com** receives: full booking details (name, email, phone, package, amount, date/time, guidance sought).

## Sender address

Emails are sent from `onboarding@resend.dev` (Resend’s default). For a custom sender like `confirmation@whispernuance.com`, verify your domain in Resend’s dashboard.
