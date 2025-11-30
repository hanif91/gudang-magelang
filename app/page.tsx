import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
	const { user } = await getCurrentSession();
	if (user === null) {
		const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
		if (portalUrl) {
			return redirect(portalUrl);
		}
	}

	return redirect("/admin");
}