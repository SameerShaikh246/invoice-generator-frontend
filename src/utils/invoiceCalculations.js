
const toCents = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return Math.round((number + Number.EPSILON) * 100);
};

export function calculateInvoice({
  items = [],
  discount = 0,
  taxRate = 0,
}) {
  const lineItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    const validQuantity =
      Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 0;

    const validPrice =
      Number.isFinite(unitPrice) && unitPrice >= 0
        ? unitPrice
        : 0;

    const lineTotalCents = Math.round(
      validQuantity * toCents(validPrice)
    );

    return {
      ...item,
      lineTotalCents,
      lineTotal: lineTotalCents / 100,
    };
  });

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );

  const discountCents = Math.min(
    toCents(discount),
    subtotalCents
  );

  const taxableCents = subtotalCents - discountCents;

  const validTaxRate =
    Number.isFinite(Number(taxRate)) && Number(taxRate) >= 0
      ? Number(taxRate)
      : 0;

  const taxCents = Math.round(
    taxableCents * validTaxRate / 100
  );

  const totalCents = taxableCents + taxCents;

  return {
    lineItems,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    taxableAmount: taxableCents / 100,
    tax: taxCents / 100,
    total: totalCents / 100,
  };
}

export function formatUSD(amount) {
  const safeAmount = Number.isFinite(Number(amount))
    ? Number(amount)
    : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeAmount);
}
