"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthInput from "./AuthInput";
import SocialButtons from "./SocialButtons";
import FormDivider from "./FormDivider";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

const LoginForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            console.log("Client-side signIn result:", result);

            if (result?.ok && !result?.error) {
                toast.success("Logged in successfully!");
                router.push("/home");
                router.refresh();
            } else {
                toast.error(result?.error || "Invalid email or password");
                setErrors({ password: "Invalid credentials" });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <>
            <SocialButtons isLoading={isLoading} actionText="Login" />

            <FormDivider />

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={isLoading}
                />

                <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    icon={Lock}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={isLoading}
                />

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-brand-dark hover:bg-brand-dark/80 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </motion.div>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                    href="/signup"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Sign up
                </Link>
            </p>
        </>
    );
};

export default LoginForm;
