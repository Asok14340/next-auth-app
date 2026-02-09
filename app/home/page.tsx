"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-dark">
                <div className="text-lg text-brand-green animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!session?.user) return null;

    const user = session.user;

    const handleLogout = async () => {
        try {
            await signOut({ callbackUrl: "/login" });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 mb-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Welcome, {user?.name || user?.email?.split('@')[0]}!
                            </h1>
                            <p className="text-gray-300 mt-2">
                                You are successfully authenticated
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-white/20">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Your Profile
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-300 w-32">Email:</span>
                            <span className="text-gray-200">{user?.email}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-medium text-gray-300 w-32">Username:</span>
                            <span className="text-gray-200">{user?.name || "N/A"}</span>
                        </div>
                        {/* Email verification status is tricky in NextAuth session unless we customize the session callback widely. 
                             For now, we'll assume verified if they are here (protected route) or show placeholder. 
                             We can add 'emailVerified' to session in auth.ts if needed. */}
                        <div className="flex items-center">
                            <span className="font-medium text-gray-300 w-32">Status:</span>
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium bg-brand-green/20 text-brand-green border border-brand-green/30"
                            >
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
