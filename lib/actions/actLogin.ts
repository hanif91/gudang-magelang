"use server";


import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/session";
import { getUserFromEmail } from "@/lib/server/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from 'bcrypt'


export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	try {

		const email = formData.get("email");
		const password = formData.get("password");
		console.log(email,password);
		if (typeof email !== "string" || typeof password !== "string") {
			return {
				message: "Invalid or missing fields"
			};
		}
		if (email === "" || password === "") {
			return {
				message: "Please enter your email and password."
			};
		}
	
		const user = await getUserFromEmail(email);
		if (user === null) {
			return {
				message: "Account does not exist"
			};
		}
	
		console.log(user.password)
		const isPasswordMatch = await bcrypt.compare(password, user.password)
		
		if (!isPasswordMatch) {
			return {
				message: "Invalid password"
			};
		}
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.id);
		await setSessionTokenCookie(sessionToken, session.expiresAt);
		return redirect("/");

	} catch (error) {
		return {
			message: "Kesalahan Server"
		};		
	}

}

interface ActionResult {
	message: string;
}