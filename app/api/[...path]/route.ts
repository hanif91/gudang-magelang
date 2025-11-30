import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join("/");
    const url = `${EXTERNAL_API_URL}/api/${path}${req.nextUrl.search}`;

    const cookieStore = await cookies();
    const token = cookieStore.get('token_gudang')?.value;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        // Use Authorization header as expected by lib/session.ts logic, 
        // but check if backend expects Cookie. 
        // Based on previous code, backend might expect Cookie or Bearer.
        // Let's send both or just one. 
        // lib/session.ts uses Authorization: Bearer.
        // Original code used Cookie.
        // Let's try Authorization first as it's more standard for APIs.
        // But wait, the original code in server actions used Cookie.
        // Let's send Cookie header to be safe if that's what it wants.
        headers["Cookie"] = `token=${token}`;
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const body = req.method !== "GET" && req.method !== "DELETE" ? await req.json() : undefined;

        const response = await axios({
            method: req.method,
            url: url,
            headers: headers,
            data: body,
            validateStatus: () => true, // Don't throw on error status
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error("Proxy Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
