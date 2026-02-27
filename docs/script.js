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
