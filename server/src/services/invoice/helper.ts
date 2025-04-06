export function normalize(doc) {
  return doc?.json;
}

export function calculateInvoicePoints(invoice) {
  const points = invoice.items.reduce((total, item) => {
    return total + item.quantity || 0;
  }, 0);

  return Math.floor(points);
}
