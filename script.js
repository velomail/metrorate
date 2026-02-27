document.getElementById("buy-button")?.addEventListener("click", () => {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("pay-button")?.addEventListener("click", () => {
  // Replace this with your real Stripe Checkout / Payment Link URL.
  //
  // How to configure:
  // 1. Go to your Stripe Dashboard → Payments → Payment Links.
  // 2. Create a Payment Link or Checkout Session for the Metrorate subscription.
  // 3. Copy the checkout URL (it usually looks like: https://checkout.stripe.com/c/pay_...).
  // 4. Paste it below in place of the placeholder string.

  const stripeCheckoutUrl = "https://checkout.stripe.com/c/REPLACE_WITH_YOUR_LINK";

  window.location.href = stripeCheckoutUrl;
});

// Set footer year automatically
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

