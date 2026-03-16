# Stripe Success Page Setup

Customers buy first, then enter their contact details on the success page. Confirmations are sent to both the customer and Whisper Nuance.

## Steps

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Product catalog** → **Payment Links**
3. Edit each Payment Link and set **Success URL** under **After payment**:

   - **Daily $11.11:** `https://whispernuance.com/success.html?package=Daily%20Reading`
   - **Weekly $33.33:** `https://whispernuance.com/success.html?package=Weekly%20Reading`
   - **Monthly $55.55:** `https://whispernuance.com/success.html?package=Monthly%20Reading`

4. Save each link.

Replace `whispernuance.com` with your domain if different. After payment, customers land on the success page and click the “Email your details” button to send their name, package, and preferred date/time to Whisper Nuance. No form or API keys needed.
