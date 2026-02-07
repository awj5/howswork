export const baseURL = process.env.NODE_ENV === "production" ? "https://admin.howswork.app" : "http://localhost:3000";

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
    1: "Upcoming",
    2: "Scheduled",
    3: "Open",
  };

  return texts[status] ?? "Closed";
}
