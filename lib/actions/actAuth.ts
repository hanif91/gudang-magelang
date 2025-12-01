'use client';

import { deleteSessionTokenCookie } from "@/lib/session";

export async function logout() {
    await deleteSessionTokenCookie();
}
