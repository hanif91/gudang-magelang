import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
	const { user } = await getCurrentSession();
	if (user === null) {
		console.log(user , "from page");
		return redirect("/login");
		
	}

	return redirect("/admin");
}