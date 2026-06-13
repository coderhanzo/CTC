export function formatPesewasToGHS(pesewas: number | null | undefined) {
  const value = Number.isFinite(pesewas) ? Number(pesewas) : 0;

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: value % 100 === 0 ? 0 : 2,
  }).format(value / 100);
}

export function ghsToPesewas(value: string | number) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * 100);
}

export function pesewasToGHS(pesewas: number | null | undefined) {
  const value = Number.isFinite(pesewas) ? Number(pesewas) : 0;

  return value / 100;
}
