"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { resetPassword } from "@/app/actions/auth";
import { toast } from "sonner";

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) {
            toast.error("Invalid reset link");
            router.push("/forgot-password");
        }
    }, [token, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) return;
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await resetPassword(token, password);
            if (result.error) {
                toast.error(result.error);
                setErrors({ general: result.error });
            } else {
                setIsSuccess(true);
                toast.success("Password reset successfully!");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Password updated</h3>
                    <p className="text-muted-foreground">Your password has been successfully reset.</p>
                </div>
                <Link href="/login">
                    <Button className="w-full h-12 bg-brand-dark hover:bg-brand-dark/80">
                        Continue to login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
                label="New Password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
            />

            <AuthInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                disabled={isLoading}
            />

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-brand-dark hover:bg-brand-dark/80 transition-all duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Reset password"
                    )}
                </Button>
            </motion.div>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </Link>
        </form>
    );
};

const ResetPasswordPage = () => {
    return (
        <AuthLayout
            title="Reset password"
            subtitle="Choose a new secure password for your account"
        >
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
