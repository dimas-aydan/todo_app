"use client"
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            email,
            redirect: false,
        });

        if (result?.error) {
            alert("Login failed. Check that you are using a seeded email.");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold text-center">Agency Todo Login</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full p-2 mt-1 border border-gray-300 rounded"
                            placeholder="e.g. admin@agency.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Sign in
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-500">
                    <p>Test Accounts:</p>
                    <ul className="list-disc ml-5">
                        <li>admin@agency.com</li>
                        <li>team@agency.com</li>
                        <li>client1@clientcorp.com</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
