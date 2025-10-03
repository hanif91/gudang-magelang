import db from "@/lib/db";


// import type { User } from "../session";

export interface UserGet {
	id: number,
	email : string,
	nama : string,
	image : string,
	password : string
}

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

// export async function createUser(email: string, username: string, password: string): Promise<User> {


	
// 	const hashedPassword = bcrypt.hashSync(password, 10)

	
// 	const row = db.execute(
// 		"INSERT INTO user (email, nama, password, provider) VALUES (?, ?, ?, ?) RETURNING user.id",
// 		[email, username, passwordHash, encryptedRecoveryCode]
// 	);
// 	if (row === null) {
// 		throw new Error("Unexpected error");
// 	}
// 	const user: User = {
// 		id: row.number(0),
// 		username,
// 		email,
// 		emailVerified: false,
// 		registered2FA: false
// 	};
// 	return user;
// }

export async function getUserFromEmail(email: string): Promise<UserGet | null> {
	const [data] : any = await db.query(
		"SELECT a.id, a.email,a.nama,a.image,a.password FROM web_admin_user a WHERE a.email = ?",
		email
	);
	if (data.length === 0){
		return null
	}

	const user : UserGet = {
		id: data[0].id,
		email : data[0].email,
		nama : data[0].nama,
		image : data[0].image,
		password : data[0].password
	};
	return user;
}
