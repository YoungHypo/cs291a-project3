"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleLogin = async(event) => {
        event.preventDefault();
        try{
            if (username) {
                const response = await fetch("http://localhost:5000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username }),
                });
                if (response.ok) {
                    console.log("Logged in as", username);
                    document.cookie = `username=${username}`;
                    router.push("/");
                } else {
                    console.error("Failed to create user");
                }
            }
        }
        catch (error) {
            console.error("Failed to create user", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleLogin} className="flex flex-col w-96 p-8 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-semibold text-gray-800">Login</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"
                />
                <button
                    type="submit"
                    className="w-1/4 px-3 py-2 mt-4 text-white bg-blue-500 rounded mx-auto block hover:bg-blue-700 transition-colors"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}