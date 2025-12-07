export const baseURL = process.env.NODE_ENV === "production" ? "https://admin.howswork.app" : "http://localhost:3000";

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (number: string) => {
  // Only numbers, spaces, or a single leading +
  if (!/^\+?\d[\d\s]*$/.test(number.replace(/\s+/g, ""))) return false;
  const digits = number.replace(/\D/g, ""); // Remove non-digits
  return digits.length >= 8 && digits.length <= 16; // Check length
};
