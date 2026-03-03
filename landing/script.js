// Apply store URL from config (from urls.json via npm run sync-urls)
document.querySelectorAll(".store-link").forEach(function (a) {
  if (window.METRORATE_URLS?.chromeWebStore) a.href = window.METRORATE_URLS.chromeWebStore;
});

document.getElementById("buy-button")?.addEventListener("click", () => {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("pay-button")?.addEventListener("click", () => {
  const stripeCheckoutUrl = "https://checkout.stripe.com/c/REPLACE_WITH_YOUR_LINK";
  window.location.href = stripeCheckoutUrl;
});

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}
