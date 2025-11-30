"use client";

import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	const action = async () => {
		const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
		if (portalUrl) {
			window.location.href = portalUrl;
		} else {
			window.location.href = "/";
		}
	};
	return (
		<form className="grow" action={action}>
			{/* <div className="flex justify-start w-full"> */}
			<Button className="w-full  justify-start border-0 px-1" size={"sm"} variant={"outline"}>
				<LogOut size={24} className='mx-2' />
				Back to Portal
			</Button>
			{/* </div> */}

		</form>
	);
}