const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
})

export function formatMoney(value: number) {
  return bdtFormatter.format(value)
}
