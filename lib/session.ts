import db from "@/lib/db";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";


export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
}

export interface User {
	id: number,
	email : string,
	nama : string,
	image : string
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}




export async function createSession(token: string, userId: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	await db.execute(
		"INSERT INTO session_web_admin (id, userid, expires_at) VALUES (?, ?, ?)",
		[session.id,
		session.userId,
		session.expiresAt]
	);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [data] : any = await db.query("SELECT a.id, a.userid, a.expires_at,b.email,b.nama,b.image FROM session_web_admin a INNER JOIN web_admin_user b ON b.id = a.userid WHERE a.id = ?",
		sessionId
	);
	if (data === null || data.length === 0) {
		return { session: null, user: null };
	}

	const session: Session = {
		id: data[0].id,
		userId: data[0].userid,
		expiresAt: data[0].expires_at
	};
	const user: User = {
		id: data[0].userid,
		email : data[0].email,
		nama : data[0].nama,
		image : data[0].image
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.execute("DELETE FROM session_web_admin WHERE id = ?", [session.id]);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db.execute(
			"UPDATE session_web_admin SET expires_at = ? WHERE id = ?",[
			session.expiresAt,
			session.id]
		);
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.execute("DELETE FROM session_web_admin WHERE id = ?", [sessionId]);
}

// export async function createUser(sessionId: string): Promise<void> {
// 	await db.execute("DELETE FROM session_web_admin WHERE id = ?", sessionId);
// }


export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/"
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/"
	});
}



export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const cookieStore = await cookies();
	const token = cookieStore.get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
});

export async function getSessionOnServerSide<SessionValidationResult> () {
	const cookieStore = await cookies();
	console.log(cookieStore)
	const token = cookieStore.get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
} 

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

