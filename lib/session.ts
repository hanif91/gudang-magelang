import { cache } from "react";
import Cookies from "js-cookie";

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}

export interface User {
  id: number;
  email: string;
  nama: string;
  image: string;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return { session: null, user: null };
    }

    const response = await fetch(`${apiUrl}/api/auth/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return { session: null, user: null };
    }

    const data = await response.json();

    // Mapping response to User interface
    // Adjust this mapping based on actual backend response
    const userData = data.user || data;

    const user: User = {
      id: userData.id,
      email: userData.email,
      nama: userData.nama,
      image: userData.image,
    };

    // Mock session object since we are using stateless/external auth
    const session: Session = {
      id: "external-session",
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };

    return { session, user };

  } catch (error) {
    console.error("Session validation error:", error);
    return { session: null, user: null };
  }
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = Cookies.get('token_gudang')?.value ?? null;
    if (cookieStore === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(cookieStore);
    return result;
  },
);

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  throw new Error("Not implemented in external auth mode");
}

export async function createSession(token: string, userId: number): Promise<Session> {
  throw new Error("Cannot create local session in separated backend mode");
}

export async function invalidateSession(sessionId: string): Promise<void> {
  // Implement backend logout if needed
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = Cookies.set('token_gudang', token, {
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = Cookies.remove('token_gudang');
}

export async function getSessionOnServerSide<SessionValidationResult>() {
  return getCurrentSession();
}
