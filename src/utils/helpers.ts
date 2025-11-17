export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const baseURL = process.env.NODE_ENV === "production" ? "https://app.moodcheck.co" : "http://localhost:3000";
