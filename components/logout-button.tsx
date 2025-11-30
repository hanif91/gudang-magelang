"use client";

import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	const action = async () => {
		const response = await fetch("/api/auth/signout", {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error("Failed to sign out");
		}
		window.location.href = "/";
	};	
	return (
		<form className="grow" action={action}>
			{/* <div className="flex justify-start w-full"> */}
				<Button  className="w-full  justify-start border-0 px-1" size={"sm"} variant={"outline"}>
					<LogOut size={24} className='mx-2'/>
					Sign out
				</Button>
			{/* </div> */}
			
		</form>
	);
}