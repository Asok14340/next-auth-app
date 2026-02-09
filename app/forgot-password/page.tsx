"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { forgotPassword } from "@/app/actions/auth";

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validateEmail = () => {
        if (!email) {
            setError("Email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) return;

        setIsLoading(true);
        try {
            const result = await forgotPassword(email);
            if (result.error) {
                setError(result.error);
            } else {
                setIsSubmitted(true);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle="We've sent you a password reset link"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-muted-foreground">
                            We've sent a password reset link to
                        </p>
                        <p className="font-medium text-foreground">{email}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Didn't receive the email? Check your spam folder or{" "}
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                            try another email
                        </button>
                    </p>

                    <Link href="/login">
                        <Button
                            variant="outline"
                            className="w-full h-12 gap-2 mt-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Button>
                    </Link>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries, we'll send you reset instructions"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    icon={Mail}
                    value={email}
                    onChange={handleChange}
                    error={error}
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
                                Sending...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>
                </motion.div>
            </form>

            <Link
                href="/login"
                className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </Link>
        </AuthLayout>
    );
};

export default ForgotPassword;
