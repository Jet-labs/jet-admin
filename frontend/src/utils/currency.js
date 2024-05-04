export const extractCurrencySpecificValue = (amount, currency) => {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency ? currency : "INR",
    maximumFractionDigits: 2,
  }).format(currency ? amount : amount / 100);
};
