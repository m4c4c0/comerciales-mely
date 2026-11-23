// Use the device's local calendar, as the mobile reports do. UTC dates can
// move evening sales into tomorrow for users in El Salvador/Guatemala.
export function localDay(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dailySales(invoices, now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + index);
    const fecha = localDay(date);
    const total = invoices
      .filter((invoice) => localDay(invoice.fecha) === fecha)
      .reduce((sum, invoice) => sum + invoice.total, 0);
    return { fecha, total: Math.round(total * 100) / 100 };
  });
}
