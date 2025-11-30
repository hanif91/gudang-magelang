'use server';

import { deleteSessionTokenCookie } from "@/lib/session";

export async function logout() {
    await deleteSessionTokenCookie();
}
