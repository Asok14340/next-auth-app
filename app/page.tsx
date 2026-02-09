"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Index = () => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/home");
        }
    }, [status, router]);

    if (status === "loading") return null;

    return (
        <AuthLayout
            title="Welcome"
            subtitle="Enter your credentials to access your account"
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default Index;
