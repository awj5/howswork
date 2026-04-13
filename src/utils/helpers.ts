export const baseURL = process.env.NODE_ENV === "production" ? "https://admin.howswork.app" : "http://localhost:3000";
export const pricingURL = `${process.env.NODE_ENV === "production" ? "https://howswork.app" : "http://localhost:3001"}/pricing`;
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function isValidPhone(number: string) {
  // Allow numbers, spaces, (), -, or a single leading +
  if (!/^\+?[\d\s\(\)\-]+$/.test(number)) return false;
  const digits = number.replace(/\D/g, ""); // Remove non-digits
  return digits.length >= 8 && digits.length <= 16; // Check length
}

export function concernStatusColor(status: number) {
  const colors: Record<number, "zinc" | "green" | "yellow" | "orange" | "blue"> = {
    1: "blue",
    2: "orange",
    3: "yellow",
    4: "green",
  };

  return colors[status] ?? "zinc";
}

export function checkInStatusText(status: number) {
  const texts: Record<number, string> = {
    1: "Scheduled",
    2: "Open",
  };

  return texts[status] ?? "Closed";
}

export function toLocalDateString(utc: string) {
  const date = new Date(utc);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function toLocalMidnightISO(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toISOString();
}

export function toLocalEndOfDayISO(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}
