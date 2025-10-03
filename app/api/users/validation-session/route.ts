import { NextResponse } from 'next/server';
// import mysqlpromise from 'mysql2/promise';
import mysql, { ConnectionOptions } from 'mysql2/promise';
import { cookies } from "next/headers";
import { validateSessionToken } from '@/lib/session';


export async function GET(request : Request) {
	try{
		const cookieStore = await cookies();
		const token = cookieStore.get("session")?.value ?? null;
		if (token === null) {
			return  NextResponse.json({ session: null, user: null });
		}
		const result = await validateSessionToken(token);
		return NextResponse.json(result)	;
		
	} catch (err) { 
		console.log(err);
		return NextResponse.json({ session: null, user: null })	
	}

}