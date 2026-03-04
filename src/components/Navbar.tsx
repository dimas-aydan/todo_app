"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
    const { data: session, status } = useSession();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (status === "loading") return null;

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
                    ? "bg-white/70 backdrop-blur-md border-gray-200 shadow-sm"
                    : "bg-white border-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                                A
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                Agency Todo
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {session?.user && (
                            <>
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {session.user.name || session.user.email}
                                    </span>
                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                                        {session.user.role}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                                >
                                    Log out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
