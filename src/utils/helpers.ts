export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const baseURL = process.env.NODE_ENV === "production" ? "https://admin.howswork.app" : "http://localhost:3000";
