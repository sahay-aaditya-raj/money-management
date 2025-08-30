export function formatINR(value) {
  const n = Number(value);
  if (!isFinite(n)) return "0.00";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
