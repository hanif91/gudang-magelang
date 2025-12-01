'use client'

import { getCurrentSession } from "@/lib/session";


export async function getUser() {
	const { user } = await getCurrentSession();
	if (user === null) {

		return null;

	}
	console.log(user)
	return user;
}