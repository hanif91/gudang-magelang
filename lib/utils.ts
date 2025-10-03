import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Google } from "arctic";



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("de-DE").format(number)
}

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID || "",
	process.env.GOOGLE_CLIENT_SECRET || "",
	`${process.env.BASE_URL}/login/google/callback`
);