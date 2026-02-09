"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/app/actions/auth";

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        verifyEmail(token)
            .then((data) => {
                if (data.success) {
                    setStatus("success");
                    setMessage(data.success);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Verification failed");
            });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                {status === "loading" && <p>Verifying your email...</p>}
                {status === "success" && (
                    <>
                        <h1 className="text-2xl font-bold text-green-600">✓ Email Verified!</h1>
                        <p className="mt-4">{message}</p>
                        <Link href="/login" className="mt-4 inline-block text-blue-600">
                            Go to Login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <h1 className="text-2xl font-bold text-red-600">✗ Verification Failed</h1>
                        <p className="mt-4">{message}</p>
                        <Link href="/login" className="mt-4 inline-block text-blue-600">
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
