export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, currency: string = "AED") {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency }).format(value);
}


